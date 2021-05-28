require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const geolib = require("geolib");

const token = process.env.TOKEN;
const apiUrl = process.env.URL;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  let message = "Received your message";
  if (msg.location) {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((json) => {
        var targetPoint = {
          longitude: msg.location.longitude,
          latitude: msg.location.latitude,
        };
        var stations = stationsList(json.stations);
        var nearest = geolib.findNearest(targetPoint, stations);
        message = `İstasyon: ${nearest.name}\nDoluluk: ${
          nearest.bicycleCount
        }/${
          nearest.capacity
        }\n\nhttps://www.google.com/maps/search/?api=1&query=${parseFloat(
          nearest.latitude
        )},${parseFloat(nearest.longitude)}`;
        bot.sendMessage(chatId, message);
      });
  } else {
    message = "En yakın istasyonu öğrenmek için lütfen konumunuzu paylaşın";
    bot.sendMessage(chatId, message);
  }
});

function stationsList(data) {
  var stations = [];
  if (data && data.length > 0) {
    data.forEach((station) => {
      if (station.Koordinat.split(",").length == 2) {
        var latitude = parseFloat(station.Koordinat.split(",")[0]);
        var longitude = parseFloat(station.Koordinat.split(",")[1]);
        if (station.Durumu == "1") {
          stations.push({
            latitude: latitude,
            longitude: longitude,
            name: station.IstasyonAdi,
            station_no: station.IstasyonID,
            is_active: station.Durumu,
            bicycleCount: station.BisikletSayisi,
            capacity: station.Kapasite,
          });
        }
      }
      //   if (
      //     station.lat.length > 0 &&
      //     station.lon.length > 0 &&
      //     station.aktif == 1
      //   ) {
      //     stations.push({
      //       latitude: station.lat,
      //       longitude: station.lon,
      //       name: station.adi,
      //       id: station.guid,
      //       station_no: station.istasyon_no,
      //       is_active: station.aktif,
      //       empty: station.bos,
      //       filled: station.dolu,
      //       last_connection: station.sonBaglanti,
      //     });
      //   }
    });
  }
  return stations;
}
