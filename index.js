const express = require('express')
const mongoose = require("mongoose")
const request = require("request")
const fetch = require("node-fetch")
var fs = require('fs')

//app
const productModel = require("./product.js")
const cache = require("./cache.js")


const app = express()
app.set('view engine', 'pug')

const baseUrl = "http://internal.ats-digital.com:3066/api/products"


//Connecting to Mongodb
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/products", {
  useMongoClient: true
})

const persistProductsFromApi = () => {
  //TODO! store HEAD content-length to know when to persist the API agin

  var contentLength = 0
  var newContentLength = 0
  fs.readFile('./meta.db', 'utf8', function (err,data) {
    if (err) console.log(err)
    if(parseInt(data) > 0) {
      contentLength = parseInt(data);
    }
  })

  request({
    method: 'HEAD',
    uri: baseUrl
  },
  function (err, res, body) {
    newContentLength = res.headers['content-length']
  })
  console.log(newContentLength , contentLength)
  if (newContentLength > contentLength) {
    fetch(baseUrl).then(function(res) {
      return res.json()
    }).then(function(data) {
      data.forEach((current) => {
        var product = new productModel()
        //TODO! check if it exists
        product.productName = current.productName
        product.basePrice = current.basePrice
        product.category = current.category
        product.brand = current.brand
        product.imageUrl = current.imageUrl
        product.productMaterial = current.productMaterial
        product.delivery = current.delivery
        product.reviews = current.reviews
        product.save(function(err,p) {
          if (err) return handleError(err)
          //console.log(p.id)
        })
      })
    })
  }
}

app.get('/persist', (req, res) => {
  persistProductsFromApi()
  res.send('done');
})

app.get('/', cache(10), (req, res) => {

  var perPage = 20, page = Math.max(0, req.param('page'))

  productModel.find()
    .limit(perPage)
    .skip(perPage * page)
    .sort({
        name: 'asc'
    })
    .exec(function(err, products) {
        productModel.count().exec(function(err, count) {
            res.render('index', {
                products: products,
                page: page,
                pages: count / perPage
            })
        })
    })
    //console.log(products)
    //console.log(products)
})


app.listen(3000, () => console.log('Server listening on port 3000!'))
