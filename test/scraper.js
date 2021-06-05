const axios = require('axios').default;
const cheerio = require('cheerio');
const fs = require('fs');
const { DBUtils } = require('@leanderpaul/shadow-novel-database');

function scraprBoxnovel(html) {
  const $ = cheerio.load(html);
  const content = $('.reading-content')
    .text()
    .split(/\n/)
    .filter((text) => text.trim())
    .map(DBUtils.formatText);
  const nextPageURL = $('.next_page').attr('href');
  const prevPageURL = $('.prev_page').attr('href');
  console.log(prevPageURL, nextPageURL);
}

function scrapeNovelFull(html) {
  const $ = cheerio.load(html);
  const content = $('#chapter-content p')
    .toArray()
    .map((element) => $(element).text())
    // .split(/\n/)
    .filter((text) => text.trim())
    .map(DBUtils.formatText);
  const nextPageURL = $('#next_chap').attr('href');
  console.log(content, nextPageURL);
}

async function scrape() {
  try {
    let hasNext = true;
    let chapterURL = 'https://novelfull.com/embers-ad-infinitum/chapter-306-strength-in-numbers.html';
    this.isScraping = true;
    while (hasNext === true && this.isScraping === true) {
      const response = await axios.get(chapterURL);
      // fs.writeFileSync('novelfull.response.html', response.data);
      // const response = {
      //   data: fs.readFileSync('novelfull.response.html')
      // };
      const result = scrapeNovelFull(response.data);
      hasNext = false;
    }
  } catch (err) {
    console.error(err);
  }
}

scrape();

/**
 * Pipeline
 */

//  [{$sort: {
//   createdAt: -1
// }}, {$lookup: {
//   from: 'users',
//   localField: 'uid',
//   foreignField: 'uid',
//   as: 'author'
// }}, {$unwind: {
//   path: '$author',
// }}, {$lookup: {
//   from: 'chapters',
//   let: {
//     nid: '$nid',
//     index: '$chapterCount'
//   },
//   pipeline: [
//       {
//         $match: {
//           $expr: {
//             $and: [
//                 {
//                   $eq: ['$nid', '$$nid']
//                 },
//                 {
//                   $eq: ['$index', '$$index']
//                 }
//               ]
//           }
//         }
//       }
//     ],
//   as: 'chapter'
// }}, {$unwind: {
//   path: '$chapter',
// }}, {$project: {
//   _id: 0,
//   nid: 1,
//   title: 1,
//   genre: 1,
//   author: {
//     uid: 1,
//     username: 1
//   },
//   chapter: {
//     cid: 1,
//     index: 1,
//     title: 1,
//     createdAt: 1
//   }
// }}]
