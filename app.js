const express = require("express");
const path = require("path");
const request = require("request");
const dotenv = require("dotenv");
const cheerio = require("cheerio");
const { resolve } = require("path");
const app = express();
app.set("views", path.join("views"));
app.set("view engine", "ejs");
app.use(express.static("include"));
dotenv.config({ path: "./config.env" });
app.get("/", (req, res) => {
  res.render("search");
});
app.get("/search/movie", (req, res) => {
  let searchName = req.query.search;
  // requesting website link for webscrapping
 
  request(
    "https://www.themoviedb.org/search?query=" + searchName + "&language=en-US",
    (err, response, html) => {
      if (!err && response.statusCode == 200) {
        let $ = cheerio.load(html);
        let allMovieTiltles = [];
        let allMovieImages = [];
        let allMovieDates = [];
        let allMovieDes = [];
        let allMovieLinks = [];
        // movie titles
        $(".card > div > div.details > div.wrapper > div > a > h2").each(
          (i, el) => {
            // console.log($(el).text());
            allMovieTiltles[i] = $(el).text();
          }
        );
        // movie Images
        $(".card> div > div.image > div > a > img").each((i, el) => {
          // console.log($(el).attr("data-src"));
          allMovieImages[i] = $(el).attr("data-src");
        });
        // movies dates
        $(".card > div > div.details > div.wrapper > div > span").each(
          (i, el) => {
            allMovieDates[i] = $(el).text();
          }
        );
        // all movie description
        $(".card > div > div.details > div.overview").each((i, el) => {
          allMovieDes[i] = $(el).text();
          if (allMovieDes[i].length > 300) {
            allMovieDes[i] = allMovieDes[i].substr(1, 280) + " ...";
          }
        });
        //movie links
        $(".card > div > div.image > div > a").each((i, el) => {
          var str = $(el).attr("href");
          str = str.split("?");
          allMovieLinks[i] = str[0];
        });

        res.render("result", {
          movieNames: allMovieTiltles,
          movieimages: allMovieImages,
          movieDates: allMovieDates,
          movieDes: allMovieDes,
          movieLinks: allMovieLinks,
          searchQuery: searchName,
        });
      }
    }
  );
});

app.get("/movie/:id",  (req, res)=> {
  var id = req.params.id;
  request(
    "https://www.themoviedb.org/movie/" + id + "?language=en-US",
    (err, response, html) => {
      let noimgpro = [];
      let noimgchar = [];
      if (!err && response.statusCode == 200) {
        var $ = cheerio.load(html);
        let movietitle = $(
          "#original_header > div.header_poster_wrapper.false > section > div.title.ott_false > h2 > a"
        ).text();
        let movieyear = $(
          "#original_header > div.header_poster_wrapper.false > section > div.title.ott_false > h2 > span"
        ).text();
        let movieimg = $(
          "#original_header > div.poster_wrapper.false > div > div.image_content.backdrop > img"
        )
          .attr("src")
          .replace("_filter(blur)", "");
        let moviedate = $(
          "#original_header > div.header_poster_wrapper.false > section > div.title.ott_false > div > span.release"
        ).text();
        let movietype = $(
          "#original_header > div.header_poster_wrapper.false > section > div.title.ott_false > div > span.genres"
        ).text();
        let movieruntime = $(
          "#original_header > div.header_poster_wrapper.false > section > div.title.ott_false > div > span.runtime"
        ).text();
        let movieuserscore = $(
          "#original_header > div.header_poster_wrapper.false > section > ul > li.chart > div.consensus.details > div > div"
        ).attr("data-percent");
        let movieoverview = $(
          "#original_header > div.header_poster_wrapper.false > section > div.header_info > div > p"
        ).text();
        for (
          var i = 1;
          i <=
          $(
            "#original_header > div.header_poster_wrapper.false > section > div.header_info > ol li"
          ).length;
          i++
        ) {
          noimgpro[i] = $(
            "#original_header > div.header_poster_wrapper.false > section > div.header_info > ol > li:nth-child(" +
              i +
              ") > p:nth-child(1) > a"
          ).text();
          noimgchar[i] = $(
            "#original_header > div.header_poster_wrapper.false > section > div.header_info > ol > li:nth-child(" +
              i +
              ") > p.character"
          ).text();
        }

        res.render("movie", {
          movietitle: movietitle,
          movieyear: movieyear,
          movieimg: movieimg,
          moviedate: moviedate,
          movietype: movietype,
          movieruntime: movieruntime,
          movieuserscore: movieuserscore,
          movieoverview: movieoverview,
          noimgchar: noimgchar,
          noimgpro: noimgpro,
        });
      }
    }
  );
});
app.listen(process.env.PORT, () => {
  console.log("Server started successfully1");
});
