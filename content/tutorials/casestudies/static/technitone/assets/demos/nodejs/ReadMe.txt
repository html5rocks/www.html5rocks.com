To run this demo code:

### On a linux server (recommended) ###
- If you don't have access to a linux server, install a copy of VirtualBox (http://www.virtualbox.org)
- Then go download Ubuntu Server 10.04 or RHEL 5.x server (the demo is built and tested using Ubuntu v10.04)
- Install node (at-least 0.6.10)
	- Download and install instructions are at: http://nodejs.org/#download
- After install is completed, copy all the source files to your home users directory:
	Ex. /home/YOU/roomDemo/[FILES]

cd into that directory and Run: npm install
The package.json file contains a list of all the required resources.

## On Windows or OS X##
- Install process is same as above, just choose the correct binary from the download page.

To run the server type: node RoomDemo.js
Connect to your servers ip to view it!
	Ex: http://10.0.1.52:8888
	or http://localhost:8888