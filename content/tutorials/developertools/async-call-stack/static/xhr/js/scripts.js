/* This demo was created to demonstrate async call stack debugging in Chrome DevTools. */
/* This demo is best viewed in Chrome Canary. */

(function(){

  var timesSubmitted = 0,
      maxTries = 3;

  // ui elements
  var submitButton = $('.letter button'),
      waitAnimation = submitButton.find('.glyphicon'),
      retryMessage = $("#retry"),
      errorMessage = $("#failed"),
      dismissButton = errorMessage.find('button.close');

  function submitHandler(event) {

    // disable submit button to avoid double-clicks
    submitButton.attr("disabled", "disabled");
    waitAnimation.show();

    // try submitting the form data
    timesSubmitted = 0;
    submitData();

  }

  function submitData() {

    // increate the counter for submission tries and then make a post request
    timesSubmitted++;
    $.post("fakeapi", postOnSuccess).fail(postOnFail);
  
  }

  function postOnSuccess(data) {

    // the post was successful!
    console.log("post success");

  } 

  function postOnFail(data) {

    // the post failed
    console.log("post fail");
    
    if ( timesSubmitted < maxTries ) {

      // maybe it's me, not you
      retrySubmit();

    }
    else {
      
      // no more retries, show error :(
      retryMessage.hide();
      errorMessage.show();
      dismissButton.click(function(){
        errorMessage.hide();
        dismissButton.unbind( "click" );
      });

      // re-enable submit button
      submitButton.removeAttr("disabled");
      waitAnimation.hide();

    }

  } 

  function retrySubmit() {

    // show retry message
    retryMessage.find('.timesSubmitted').text(timesSubmitted);
    retryMessage.show();

    // wait to call submitData() again
    setTimeout( submitData, 1000 ); 

  }

  // submit button event handler
  submitButton.click(submitHandler);

}());