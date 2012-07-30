var localStore = {
  supported: function(handler) {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
      return false;
    }
  },
  setup: function(handler) {
    if (!localStorage.checkins) localStore.reset();
    handler();
  },
  reset: function(handler) {
    localStorage.checkins = JSON.stringify([]);
    if (handler) handler();
  },
  save: function(checkin, handler) {
    var checkins = JSON.parse(localStorage.checkins);
    checkins.push(checkin);
    localStorage.checkins = JSON.stringify(checkins);
    handler();
  },
  search: function(moodQuery, handler) {
    var allCheckins = JSON.parse(localStorage.checkins);
    var matchingCheckins = [];
    allCheckins.forEach(function(checkin) {
      if (checkin.mood==moodQuery||!moodQuery) handler((clone(checkin)));
    });
  },
  count: function(handler) {
    handler(JSON.parse(localStorage.checkins).length);
  }
};
