"use strict";

function get_promise(url) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "GET",
      url: url,
      contentType: "application/json",
      dataType: "jsonp",
      success: function success(data) {
        return resolve(data);
      },
      error: function error(err) {
        return reject(err);
      }
    });
  });
}

var twitch = {
  provided_streamers: ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "noobs2ninjas", "beohoff", "streamerhouse", "comster404"],
  base_url: "https://api.twitch.tv/kraken",
  start: function start() {
    var _this = this;

    //array of promises for channel info from each provided streamer:
    var streamer_channels = this.provided_streamers.map(function (name) {
      return get_promise(_this.base_url + "/channels/" + name);
    });
    //when all responses come back (channel_arr is array of response objects):
    Promise.all(streamer_channels).then(function (channel_arr) {
      var names = [];
      channel_arr.forEach(function (response_data) {
        if (response_data.display_name) {
          var row_tag = "<div class='row'> <div class='name col-xs-4 col-md-2 col-md-offset-3'>" + (response_data.logo ? "<img src=" + response_data.logo + "></img>" : "") + "<a href=" + response_data.url + ">" + response_data.display_name + "</a>" + "</div>" + "<div class='status col-xs-8 col-md-4 col-md-offset 5' id='" + response_data.display_name + "'>" + (response_data.status ? "<span class='highlight'>" + response_data.status + " </span>" : "Not currently streaming") + "</div></div>";
          document.getElementById("results").innerHTML += row_tag;
          names.push(response_data.display_name);
        } else {
          //show streamer as unavailable or non-existent
        }
      });
      return Promise.all(names.map(function (name) {
        return get_promise(_this.base_url + "/streams/" + name);
      }));
    })
    //filter 'response list' down to only results with stream data
    .then(function (response_list) {
      return response_list.filter(function (item) {
        return !!item.stream;
      });
    }).then(function (elements_with_streams) {
      return elements_with_streams.forEach(function (data) {
        var ele = document.getElementById(data.stream.channel.display_name);
        ele.innerText = "Currently streaming '" + data.stream.game + "'";
        ele.classList.add("streaming");
      });
    }).catch(function (err) {
      return console.log(err);
    });
  }
};
window.onload = function () {
  twitch.start();
};