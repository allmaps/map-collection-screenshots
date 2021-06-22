const axios = require('axios')
const sharp = require('sharp')
const puppeteer = require('puppeteer')

const mapCollectionsUrl = 'https://allmaps.org/iiif-map-collections/iiif-map-collections.json'

const scale = 0.8
const viewport = {
  width: 1280 * scale,
  height: 800 * scale,
  deviceScaleFactor: 1
}

async function takeScreenshot (browser, id, url) {
  console.log(`Taking screenshots for ${id}...`)

  const filename = `images/${id}.png`
  const jpgFilename = `images/${id}.jpg`
  const smallFilename = `images/${id}-small.jpg`

  const page = await browser.newPage()
  await page.setViewport(viewport)
  await page.goto(url, {
    waitUntil: ['domcontentloaded', 'networkidle2'],
    timeout: 0
  })
  await page.screenshot({ path: filename })

  await sharp(filename)
    .toFile(jpgFilename)

  await sharp(filename)
    .resize(viewport.width / 2)
    .toFile(smallFilename)
}

async function run () {
  const browser = await puppeteer.launch()

  const mapCollections = await axios(mapCollectionsUrl)
    .then((response) => response.data)

  const mapCollectionsWithId = mapCollections
    .filter((mapCollection) => mapCollection.id)

  for (const mapCollection of mapCollectionsWithId) {
    await takeScreenshot(browser, mapCollection.id, mapCollection.url)
  }

  await browser.close()
}

run()
