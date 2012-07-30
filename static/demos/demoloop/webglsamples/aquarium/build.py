#!/usr/bin/python
#
# Copyright (c) 2006-2010 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""build system for assets"""

import build_system
import re
import os
import sys
import shutil
import json
from optparse import OptionParser

MAYABATCH_EXE = "c:/Program Files/Autodesk/Maya2009/bin/mayabatch.exe"
COLLADA_PLUGIN = "C:/Program Files/Autodesk/Maya2009/bin/plug-ins/COLLADAMaya.mll"
O3D_CONVERTER_EXE = "c:/src/o3d_bango/o3d/build/debug/o3dconverter.exe"

def main(argv):
  """This is the main function."""
  parser = OptionParser()
  parser.add_option(
      "--no-execute", action="store_true",
      help="does not execute any external commands")
  parser.add_option(
      "--force", action="store_true",
      help="forces building regardless of dates.")
  parser.add_option(
      "--pretty", action="store_true",
      help="make json pretty.")
  parser.add_option(
      "-v", "--verbose", action="store_true",
      help="prints more output.")
  parser.add_option(
      "-d", "--debug", action="store_true",
      help="turns on debugging.")

  (options, args) = parser.parse_args(args=argv)

  b = build_system.BuildSystem(
      options.verbose, options.force, not options.no_execute, options.debug)

  # The first array is args
  # The second array is the source files to check
  # The third array is the destination files expected to be built.
  # b.ExecuteIf(['cp', 'src1.txt', 'dst1.txt'], ['src1.txt'], ['dst1.txt'])

  # The process is
  # 1) Convert maya 2010 file to maya 2009 file since I only have 2009
  # 2) Load maya file and export as collada file
  # 3) Load collada file and extract info.

  maya_files = [
    'source_assets/Scenes/Arch.ma',
    'source_assets/Scenes/BigFishA.ma',
    'source_assets/Scenes/BigFishB.ma',
    'source_assets/Scenes/Coral.ma',
    'source_assets/Scenes/CoralStoneA.ma',
    'source_assets/Scenes/CoralStoneB.ma',
    'source_assets/Scenes/EnvironmentBox.ma',
    'source_assets/Scenes/FloorBase_Baked.ma',
    'source_assets/Scenes/FloorCenter.ma',
    'source_assets/Scenes/GlobeBase.ma',
    'source_assets/Scenes/GlobeInner.ma',
    'source_assets/Scenes/GlobeOuter.ma',
    'source_assets/Scenes/LightRay.ma',
    'source_assets/Scenes/MediumFishA.ma',
    'source_assets/Scenes/MediumFishB.ma',
    'source_assets/Scenes/RockA.ma',
    'source_assets/Scenes/RockB.ma',
    'source_assets/Scenes/RockC.ma',
    'source_assets/Scenes/RuinColumn.ma',
    'source_assets/Scenes/SmallFishA.ma',
    'source_assets/Scenes/SeaweedA.ma',
    'source_assets/Scenes/SeaweedB.ma',
    'source_assets/Scenes/Skybox.ma',
    'source_assets/Scenes/Stone.ma',
    'source_assets/Scenes/Stones.ma',
    'source_assets/Scenes/SunknShip.ma',
    'source_assets/Scenes/SunknSub.ma',
    'source_assets/Scenes/SupportBeams.ma',
    'source_assets/Scenes/TreasureChest.ma',
  ]

  temp_path = 'temp'
  if not os.path.exists(temp_path):
    os.mkdir(temp_path)

  out_path = 'assets'

  for file in maya_files:
    ConvertMayaFile(b, file, temp_path, out_path, options.pretty)

  MakePlacementData(
     b, "source_assets/scenes/PropPlacement.ma",
     temp_path, out_path, options.pretty)

# Convenience functions

def MakeOutputFile(input_file, temp_path, extension):
  """Generates the name of an output file."""
  (base_name, ext) = os.path.splitext(os.path.basename(input_file))
  return os.path.join(temp_path, base_name + extension)


def UnixifyPath(file_path):
  """converts \ to /"""
  return file_path.replace("\\", "/")

def MakeTexturePath(tex_base):
  return UnixifyPath(
     os.path.abspath(
         os.path.join(
             "source_assets", "sourceimages", tex_base)))

def FindTexture(tex_path):
  """Looks for a texture by changing the extension."""
  tex_base = os.path.basename(tex_path)
  (tex_name, tex_ext) = os.path.splitext(tex_base)
  tex_path = MakeTexturePath(tex_base)
  # try converting to .png and .jpg
  for ext in [".png", ".jpg"]:
    tex_path = MakeTexturePath(tex_name + ext)
    if os.path.exists(tex_path):
      break
  if not os.path.exists(tex_path):
    return None
  return tex_path


def FixTexturePath(m_ob):
  p = m_ob.group(1)
  prefix = ""
  print "fix: ", p
  if p.startswith("file:///"):
    prefix = "file:///"
    p = p[8:]
    new_path = FindTexture(p)
    if new_path:
      p = new_path
    else:
      print "ERROR: MISSING TEXTURE: %s" % p
      p = MakeTexturePath("error.jpg")
  return "<init_from>%s%s</init_from>" % (prefix, p)


def ConvertMaya2010To2009(builder, input_file, output_file, temp_path):
  """."""
  if builder.ShouldBuild([input_file], [output_file]):
    file = open(input_file, "rb")
    data = file.read()
    file.close()
    data = data.replace('requires maya "2010";', 'requires maya "2009";')
    data = data.replace('requires "stereoCamera" "10.0";', '')
    data = data.replace('stereoCameraView -e', '')
    file = open(output_file, "wb")
    file.write(data)
    file.close()
  return


def ConvertMayaToCollada(builder, input_file, output_file, temp_path):
  """."""
  if builder.ShouldBuild([input_file], [output_file]):
    # write out mel script to export
    mel_file = MakeOutputFile(input_file, temp_path, ".mel")
    log_file = MakeOutputFile(input_file, temp_path, "_mayalog.txt")
    file = open(mel_file, "w")
    file.write('loadPlugin "%s";\n' % COLLADA_PLUGIN)
    file.write('file -o "%s";\n' % UnixifyPath(os.path.abspath(input_file)))
    out_cmd = (''
      'file -op "'
      'bakeTransforms=0;'
      'relativePaths=0;'
      'copyTextures=0;'
      'exportTriangles=0;'
      'cgfxFileReferences=1;'
      'isSampling=0;'
      'curveConstrainSampling=0;'
      'removeStaticCurves=1;'
      'exportPolygonMeshes=1;'
      'exportLights=1;'
      'exportCameras=1;'
      'exportJointsAndSkin=1;'
      'exportAnimations=1;'
      'exportInvisibleNodes=0;'
      'exportDefaultCameras=0;'
      'exportTexCoords=1;'
      'exportNormals=1;'
      'exportNormalsPerVertex=1;'
      'exportVertexColors=1;'
      'exportVertexColorsPerVertex=1;'
      'exportTexTangents=1;'
      'exportTangents=0;'
      'exportReferencedMaterials=1;'
      'exportMaterialsOnly=0;'
      'exportXRefs=1;'
      'dereferenceXRefs=1;'
      'exportCameraAsLookat=0;'
      'cameraXFov=0;'
      'cameraYFov=1;'
      'doublePrecision=0;'
      '" -typ "OpenCOLLADA exporter" -f -pr -ea "%s";\n') % (
        UnixifyPath(os.path.abspath(output_file)),)
    file.write(out_cmd)
    file.close()
    builder.ExecuteIf(
       [MAYABATCH_EXE,
        '-log', os.path.abspath(log_file),
        '-script', os.path.abspath(mel_file)],
       [input_file], [output_file])


def GetJSObjectByTypeAndId(js, type, id, throw_on_fail = True):
  """."""
  for object in js['objects'][type]:
    if object['id'] == id:
      return object
  if throw_on_fail:
    raise RuntimeError("Object %s id:%d does not exist" % (type, id))
  return None


def GetParamRef(obj, name):
  value = obj['params'][name]['value']
  if value:
    return value['ref']
  return None


def ConvertColladaToJS(builder, input_file, output_file, temp_path):
  """."""
  temp_js_file = MakeOutputFile(output_file, temp_path, ".js")
  # this is the file the o3dConverter will create.
  temp_scene_file = os.path.join(
      os.path.dirname(temp_js_file),
      os.path.splitext(os.path.basename(temp_js_file))[0],
      "scene.json")

  if builder.ShouldBuild([input_file], [temp_scene_file]):
    # find all paths and make them relative. This is needed because
    # of bugs in the o3dConverter
    file = open(input_file, "rb")
    data = file.read()
    file.close()
    r = re.compile(r'<init_from>([^<]+(?<=[jpg|png|tga]))</init_from>',
                   re.IGNORECASE)

    temp_file = MakeOutputFile(input_file, temp_path, ".fixedpath.dae")

    data = r.sub(FixTexturePath, data)
    file = open(temp_file, "wb")
    file.write(data)
    file.close()
    #sys.exit()

    builder.ExecuteIf(
      [O3D_CONVERTER_EXE,
       '--pretty-print',
       '--no-binary',
       '--no-archive',
  #     '--asset-paths=%s' % os.path.abspath('source_assets\sourceimages'),
       temp_file,
       temp_js_file],
      [temp_file], [temp_scene_file])

  return temp_scene_file


def ConvertColladaToModelJS(
    builder, input_file, output_file, temp_path, pretty):
  """."""
  if builder.ShouldBuild([input_file], [output_file]):
    temp_scene_file = ConvertColladaToJS(
        builder, input_file, output_file, temp_path)
    # load the scene file, extract the data we want and write it back out
    file = open(temp_scene_file, "rb")
    data = file.read()
    file.close()
    js = json.loads(data)

    models = []
    data = { 'models': models }

    # Get all fieids
    fields = {}
    for vb in js['objects']['o3d.VertexBuffer']:
      for field in vb['custom']['fieldData']:
        fields[field['id']] = field

    semantics = [
      '*unknown*',
      'position',
      'normal',
      'tangent',
      'binormal',
      'color',
      'texCoord',
    ]

    # extract the models
    for prim in js['objects']['o3d.Primitive']:
      print "Model: %s" % prim['properties']['name']
      out_fields = {}
      model = {'fields': out_fields}
      models.append(model)
      # extract buffer data
      sb = GetJSObjectByTypeAndId(
          js, 'o3d.StreamBank', GetParamRef(prim, 'o3d.streamBank'))
      for stream in sb['custom']['vertexStreams']:
        field = fields[stream['stream']['field']]
        semantic = semantics[stream['stream']['semantic']]
        out_fields[semantic] = {
          'type': 'Float32Array',
          'numComponents': field['numComponents'],
          'data': field['data']
        }
      # extract index bufffer
      i_buf = GetJSObjectByTypeAndId(
            js, 'o3d.IndexBuffer', prim['custom']['indexBuffer'])
      out_fields['indices'] = {
        'type': 'Uint16Array',
        'numComponents': 3,
        'data': i_buf['custom']['fieldData'][0]['data']
      }

      # extract diffuse params and texture name
      material = GetJSObjectByTypeAndId(
          js, 'o3d.Material', GetParamRef(prim, 'o3d.material'))
      diffuseSampler = GetJSObjectByTypeAndId(
          js, 'o3d.Sampler', GetParamRef(material, 'diffuseSampler'))
      texture_id = GetParamRef(diffuseSampler, 'o3d.texture')
      if texture_id:
        diffuseTexture = GetJSObjectByTypeAndId(
            js, 'o3d.Texture2D', texture_id)
        texture = os.path.basename(diffuseTexture['params']['o3d.uri']['value'])
        print "Texture:", texture
      else:
        print "***MISSING TEXTURE***"
        texture = "error_DM.jpg"

      textures = {}
      model['textures'] = textures
      textures['diffuse'] = texture
      # check for various textures
      for suffix in [
          {'name': 'normalMap',     'suffix': '_NM'},
          {'name': 'reflectionMap', 'suffix': '_RM'}]:
        tex = FindTexture(texture.replace('_DM', suffix['suffix']))
        if tex:
          tex = os.path.basename(tex)
          print "Texture:", tex
          textures[suffix['name']] = tex

      # copy the textures to assets
      for key in textures:
        texture = textures[key]
        shutil.copyfile(
            os.path.join('source_assets', 'sourceimages', texture),
            os.path.join('assets', texture))

    file = open(output_file, "wb")
    if pretty:
      file.write(json.dumps(data, sort_keys=True, indent=4))
    else:
      file.write(json.dumps(data, separators=(',', ':')))
    file.close()

    if not builder.VerifyExists([output_file]):
      raise RuntimeError("Failed to build: %s" % output_file)

def MatMult(b, a):
  """multiply 2 4x4 matrices"""
  a00 = a[0*4+0]
  a01 = a[0*4+1]
  a02 = a[0*4+2]
  a03 = a[0*4+3]
  a10 = a[1*4+0]
  a11 = a[1*4+1]
  a12 = a[1*4+2]
  a13 = a[1*4+3]
  a20 = a[2*4+0]
  a21 = a[2*4+1]
  a22 = a[2*4+2]
  a23 = a[2*4+3]
  a30 = a[3*4+0]
  a31 = a[3*4+1]
  a32 = a[3*4+2]
  a33 = a[3*4+3]
  b00 = b[0*4+0]
  b01 = b[0*4+1]
  b02 = b[0*4+2]
  b03 = b[0*4+3]
  b10 = b[1*4+0]
  b11 = b[1*4+1]
  b12 = b[1*4+2]
  b13 = b[1*4+3]
  b20 = b[2*4+0]
  b21 = b[2*4+1]
  b22 = b[2*4+2]
  b23 = b[2*4+3]
  b30 = b[3*4+0]
  b31 = b[3*4+1]
  b32 = b[3*4+2]
  b33 = b[3*4+3]
  return [
    a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
    a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
    a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
    a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
    a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
    a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
    a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
    a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
    a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
    a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
    a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
    a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
    a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
    a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
    a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
    a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33]


def GetParentTransform(js, transform):
  """."""
  parent = None
  if 'parent' in transform['properties']:
    parent = GetJSObjectByTypeAndId(
        js, 'o3d.Transform', transform['properties']['parent']['ref'], False)
  return parent


def GetWorldMatrix(js, transform):
  m44 = transform['params']['o3d.localMatrix']['value']
  localMatrix = [
    m44[0][0], m44[0][1], m44[0][2], m44[0][3],
    m44[1][0], m44[1][1], m44[1][2], m44[1][3],
    m44[2][0], m44[2][1], m44[2][2], m44[2][3],
    m44[3][0], m44[3][1], m44[3][2], m44[3][3],
  ]
  parent = GetParentTransform(js, transform)
  if parent:
    worldMatrix = GetWorldMatrix(js, parent)
    return MatMult(worldMatrix, localMatrix)
  else:
    return localMatrix


def GetSceneName(name):
  # remove digits
  name = re.sub(r'\d+$', '', name)
  # remove "shape"
  if name.endswith('Shape'):
    name = name[:-5]
  # remove digits
  name = re.sub(r'\d+$', '', name)
  # remove '_'
  name = re.sub(r'_+$', '', name)
  return name


def ConvertColladaToLevelJS(
    builder, input_file, output_file, temp_path, pretty):
  """."""
  if builder.ShouldBuild([input_file], [output_file]):
    temp_scene_file = ConvertColladaToJS(
        builder, input_file, output_file, temp_path)
    # load the scene file, extract the data we want and write it back out
    file = open(temp_scene_file, "rb")
    data = file.read()
    file.close()
    js = json.loads(data)

    objects = []
    data = { 'objects': objects }

    # Get all shapes
    for transform in js['objects']['o3d.Transform']:
      for shapeRef in transform['properties']['shapes']:
        shape = GetJSObjectByTypeAndId(js, 'o3d.Shape', shapeRef['ref'])
        shapeName = GetSceneName(shape['properties']['name'])
        parentName = "***"
        parent = GetParentTransform(js, transform)
        if parent:
          parentName = GetSceneName(parent['properties']['name'])
        worldMatrix = GetWorldMatrix(js, transform)

        skipOtherShapes = False
        if shapeName.startswith(parentName):
          shapeName = parentName
          skipOtherShapes = True

        objects.append({
          'name': shapeName,
          'worldMatrix': worldMatrix,
          })

        if skipOtherShapes:
          break

    file = open(output_file, "wb")
    if pretty:
      file.write(json.dumps(data, sort_keys=True, indent=4))
    else:
      file.write(json.dumps(data, separators=(',', ':')))
    file.close()

    if not builder.VerifyExists([output_file]):
      raise RuntimeError("Failed to build: %s" % output_file)


# Build rules
def ConvertMayaFile(builder, input_file, temp_path, out_path, pretty):
  """."""
  maya_file = MakeOutputFile(input_file, temp_path, '_2009.ma')
  collada_file = MakeOutputFile(input_file, temp_path, '.dae')
  js_file = MakeOutputFile(input_file, out_path, '.js')
  ConvertMaya2010To2009(builder, input_file, maya_file, temp_path)
  ConvertMayaToCollada(builder, maya_file, collada_file, temp_path)
  ConvertColladaToModelJS(builder, collada_file, js_file, temp_path, pretty)

def MakePlacementData(builder, input_file, temp_path, out_path, pretty):
  """."""
  maya_file = MakeOutputFile(input_file, temp_path, '_2009.ma')
  collada_file = MakeOutputFile(input_file, temp_path, '.dae')
  js_file = MakeOutputFile(input_file, out_path, '.js')
  ConvertMaya2010To2009(builder, input_file, maya_file, temp_path)
  ConvertMayaToCollada(builder, maya_file, collada_file, temp_path)
  ConvertColladaToLevelJS(builder, collada_file, js_file, temp_path, True)


if __name__ == '__main__':
  main(sys.argv[1:])

