<template >
  <div style="margin-bottom: 14px;" v-bind:style="{ height: docHeight + 'px' }" v-bind:class="{ 'stop-scrolling': !busy }">
    <header>
      <div style="position: fixed; z-index: 10; width: 100%; background-color: #111;">
        <b-container>
          <b-row>
              <b-col class="icon-bg" cols="2">
                <h4>
                  <a href="/" class="icon-link">
                    FNDR
                  </a>
                </h4>
              </b-col>
              <b-col>
                <div style="margin-top: 6.5px;">

                    <router-link
                      v-for="vendor in urlVendors"
                      :to="{ path: vendor.path }"
                      :key="vendor.vendor"
                      v-on:click.native="vendorIsClicked(vendor)"
                      style="color: #FFF; text-decoration: none;"
                    >
                    <span
                      class="source-link"
                      v-bind:class="{ 'source-link-active': vendor.isClicked }"
                    >
                      {{ vendor.vendor }}
                    </span>
                    </router-link>
                </div>
              </b-col>
          </b-row>
        </b-container>
      </div>
    </header>

    <transition  name="list"  mode="out-in" appear>
      <router-view :list="posts" :returnDate="returnDate" :key="posts.length" style="padding-top: 0px;"></router-view>
    </transition>

    <!-- <div v-bind:class="{ hidden: isHidden }">
      <div>
        <div class="container">
          <div class="more-stories row">
            <div class="col-12" v-on:click="moreStories">
              MORE STORIES
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import moment from 'moment'

export default {
  name: 'app',
  data: () => ({
    busy: false,
    layoutSetting: 'large',
    buffer: [],
    posts: [],
    errors: [],
    isHidden: true,
    urlVendors: [
      {
        vendor: 'MTV News',
        path: '/mtv',
        siteURL: 'mtv-news',
        homepage: 'http://mtv.com/news/music',
        isClicked: false
      },
      {
        vendor: 'The Verge',
        path: '/theverge',
        siteURL: 'the-verge',
        homepage: 'http://theverge.com',
        isClicked: false
      },
      {
        vendor: 'Recode',
        path: '/recode',
        siteURL: 'recode',
        homepage: 'http://recode.com',
        isClicked: false
      },
      {
        vendor: 'Polygon',
        path: '/polygon',
        siteURL: 'polygon',
        homepage: 'http://polygon.com',
        isClicked: false
      },
      {
        vendor: 'TNW',
        path: '/tnw',
        siteURL: 'the-next-web',
        homepage: 'https://thenextweb.com/',
        isClicked: false
      },
      {
        vendor: 'BBC',
        path: '/bbc',
        siteURL: 'bbc-news',
        homepage: 'http://bbc.com',
        isClicked: false
      },
      {
        vendor: 'BBC Sport',
        path: '/bbcsport',
        siteURL: 'bbc-sport',
        homepage: 'http://bbc.com/sport',
        isClicked: false
      },
      {
        vendor: 'NATGEO',
        path: '/natgeo',
        siteURL: 'national-geographic',
        homepage: 'http://nationalgeographic.com',
        isClicked: false
      }
    ]
  }),
  computed: {
    docHeight: window.document.body.scrollHeight - window.document.documentElement.clientHeight,
    key: function () {
      return this.$route.meta.key !== undefined
        ? this.$route.meta.key
        : this.$route
    },
    sortedItems: function () {
      this.buffer.sort((a, b) => {
        return moment(b.publishedAt).valueOf() - moment(a.publishedAt).valueOf()
      })
      return this.buffer
    }
  },
  methods: {
    onScroll: function (e, position) {
      console.log('The position is: ' + position)
      this.position = position
    },
    fetchArticles: function () {
      let self = this
      var promises = []
      this.posts = []
      this.buffer = []

      // console.log('Fetching')
      promises = self.urlVendors.map((site) => {
        // console.log(site)
        if (site.isClicked) {
          var self = this
          var siteURL = 'https://newsapi.org/v1/articles?source=' + site.siteURL + '&sortBy=latest&apiKey=b3e8f523645e4678a2355e4603dfdd42'
          if (site.siteURL !== 'the-next-web') {
            siteURL = 'https://newsapi.org/v1/articles?source=' + site.siteURL + '&sortBy=top&apiKey=b3e8f523645e4678a2355e4603dfdd42'
          }

          return axios.get(siteURL)
          .then(response => {
            var posts = response.data.articles

            posts.forEach(function (item, index, array) {
              // Inject own params
              item.isLiked = false
              item.vendor = site.vendor
              item.homepage = site.homepage

              if (!item.urlToImage.endsWith('bbc-sport-logo.png')) {
                Vue.set(self.buffer, self.buffer.length, item)
              }
            })
          })
          .catch(e => {
            self.errors.push(e)
          })
        }
      })

      Promise.all(promises).then(() => {
        // var postsLength = self.posts.length
        var bufferLength = self.buffer.length

        // console.log("Posts length: " + (this.posts.length))
        // console.log("Buffer length: " + this.buffer.length)
        // console.log(this.buffer)

        if (bufferLength <= 8) {
          self.makeHidden()
        } else {
          self.makeVisible()
        }

        // load 8 articles from buffer
        for (let i = 0; i < bufferLength; i++) {
          var postsLengthCurr = self.posts.length
          if (postsLengthCurr < bufferLength) {
            Vue.set(self.posts, self.posts.length, self.sortedItems[i])
          }
        }

        // console.log('End promise')
        // console.log(this.posts)
      })
    },
    vendorIsClicked: function (vendor) {
      // Update posts
      // console.log("Posts length: " + this.posts.length)
      // for (let i = 0; i < this.posts.length; i++) {
      //   console.log("Checking index: " + i)
      //   if (this.posts[i].vendor === vendor.vendor) {
      //     this.posts.splice(i, 1)
      //   }
      // }
      var self = this

      this.posts = this.posts.filter((post) => {
        if (post.vendor !== vendor.vendor) {
          return post
        }
      })

      this.buffer = this.buffer.filter((post) => {
        if (post.vendor !== vendor.vendor) {
          return post
        }
      })

      // Update visible posts count
      // console.log("Posts count: " + this.posts.length)
      if (this.posts.length < 9) {
        // var lenNeedToAdd = 8 - this.posts.length
        // console.log("Need to add num posts: " + lenNeedToAdd)
        // console.log("Buffer: " + this.buffer)

        var postsLengthCurr = self.posts.length
        var totalVisibleLessPostsLength = 8 - this.posts.length
        // console.log("For loop len: " + totalVisibleLessPostsLength)
        for (let i = 0; i < totalVisibleLessPostsLength; i++) {
          // console.log("Adding: " + i)
          // console.log(self.buffer)
          // console.log("Buffer length: " + this.buffer.length)
          var bufferIndexToAdd = postsLengthCurr + i
          // console.log("Index of buffer to add from: " + bufferIndexToAdd)
          if (bufferIndexToAdd < this.buffer.length) {
            // console.log("Should be adding here!")
            // console.log(self.buffer)
            Vue.set(self.posts, self.posts.length, self.buffer[postsLengthCurr + i])
          }
        }
      }

      // Update buffer
      this.buffer = this.buffer.filter((post) => {
        if (post.vendor !== vendor.vendor) {
          return post
        }
      })

      // Handle toggle
      if (vendor.isClicked === false) {
        vendor.isClicked = true

        // console.log("On click")

        // Append to cookies
        var sources = this.$cookie.get('activeSources').split(',')
        sources.push(vendor.siteURL)
        this.$cookie.set('activeSources', sources, 7)

        this.fetchArticles()
      } else {
        vendor.isClicked = false

        // console.log("Off click")

        // Remove match, and update cookies
        sources = this.$cookie.get('activeSources').split(',')
        var index = sources.indexOf(vendor.siteURL)
        if (index > -1) {
          sources.splice(index, 1)
        }
        this.$cookie.set('activeSources', sources, 7)
        // End cookies

        // Handle stories button
        if (this.posts.length === 0) {
          this.makeHidden()
        } else {
          this.makeVisible()
        }
        // End handle stories button
      }
    },
    handleCookies: function () {
      // console.log("Getting cookies: ")
      // console.log(this.$cookie.get('sources')
      //
      // console.log("Created")
      var cookies = this.$cookie.get('activeSources')

      if (cookies === null) {
        // console.log("Cookies are null")
        this.$cookie.set('activeSources', ['the-verge', 'recode'], 7)
      } else {
        // console.log("Cookies: " + this.$cookie.get('activeSources'))
        // console.log("Getting cookies...")
        var sources = this.$cookie.get('activeSources').split(',')

        // console.log("Cookies val: " + sources)
        // console.log(sources.length)

        this.urlVendors = this.urlVendors.filter((vendor) => {
          if (sources.includes(vendor.siteURL)) {
            vendor.isClicked = true
          } else {
            vendor.isClicked = false
          }

          return vendor
        })
      }
    },
    returnDate: function (data) {
      var now = moment(data).format('lll')
      return now
    },
    moreStories: function (maxPageHeight) {
      var self = this
      var posts = self.posts
      var buffer = self.buffer
      var bufferLength = self.buffer.length
      var baseLength = self.posts.length

      this.busy = true
      console.log('Adding...')
      console.log('Total: ' + bufferLength)
      console.log('Base length: ' + baseLength)
      console.log('Buffer length: ' + bufferLength)

      // Add stories from buffer,
      // and remove button if no more stories to show

      // console.log("Posts length: " + baseLength)
      if (self.posts.length + 8 > bufferLength) {
        self.makeHidden()
      } else {
        self.makeVisible()
      }

      if (baseLength < (bufferLength)) {
        // add stories
        for (let i = 0; i < 8; i++) {
          if ((posts.length) < buffer.length) {
            posts.push(buffer[baseLength + i])
          }
        }
        // window.scrollTo(0, maxPageHeight)
      }

      // console.log('Max pageHeight, again: ' + maxPageHeight)

      // console.log("New posts length: " + self.posts.length)
      // console.log("Buffer length: " + self.buffer.length)
    },
    toggleLike: function (index) {
      this.posts[index].isLiked = !this.posts[index].isLiked
    },
    makeHidden: function () {
      this.isHidden = true
    },
    makeVisible: function () {
      this.isHidden = false
    }
  },
  created () {
    // var self = this
    this.handleCookies()
    this.fetchArticles()

    console.log('Created')
    window.document.body.onscroll = function (point) {
      var windowHeight = window.document.documentElement.clientHeight
      var pageHeight = window.document.body.scrollHeight
      var maxPageHeight = (pageHeight - windowHeight)
      var scrollPosition = window.scrollY
      console.log(scrollPosition + ' of ' + maxPageHeight)

      // point.preventDefault()
      // if (scrollPosition === maxPageHeight && self.busy === false) {
      //   console.log('Reached the end...')
      //   console.log('Page height: ' + maxPageHeight)
      //   // window.scrollTop(0)
      //   self.busy = true
      //   setTimeout(() => {
      //     self.moreStories(maxPageHeight)
      //     // this.busy = false
      //   }, 1000)
      // }
      // Max height
      // document.documentElement.clientHeight

      // Document height
      // document.body.scrollHeight
    }
    // setInterval(function () {
    //   this.fetchArticles()
    // }.bind(this), 180000)
  }
}
</script>

<style>
html, body {
  margin:0;
  padding:0;
  height:100%;
  font-size: 16px;
}

a {
  color: #333;
  transition: .2s ease;
}

a:hover {
  color: #1469c3;
}

h2 {
  font-weight: bolder;
  text-transform: uppercase;
}

h5 a {
  color: #333;
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.26px;
  line-height: 6px;
  font-family: 'Roboto Condensed', sans-serif;
}

h4 a {
  color: #333;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

img {
  transform: scale(1.0, 1.0);
}

footer {
  -webkit-animation-delay: 2s;
}

.icon-link {
  color: #FFF;
}

.icon-link:hover {
  /*color: #f4f4f4;*/
  color: #FFF;
  text-decoration: none;
}

.homepage-link {
  color: #FFF;
  background-color: #0AA8D3;
  margin-right: 10px;
  padding: 6px 12px;
  height: 10px;
  line-height: 10px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  text-transform: uppercase;
}

.homepage-link span {
  color: #FFF;
}

.homepage-link:hover {
  text-decoration: none;
}

.icon-bg {
  background-color: #0AA8D3;
  padding-top: 6px;
  padding-bottom: 4px;
}

.source-link {
  color: #FFF;
  background-color: #333;
  margin: 10px;
  padding: 6px 12px;
  height: 10px;
  line-height: 10px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  transition: .3s ease;
}

.source-link-active {
  background-color: #0AA8D3;
}

.source-link:hover {
  background-color: #0AA8D3;
}

.more-stories {
  background-color: #333;
  color: #FFF;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 16px;
  padding: 10px;
  transition: .3s ease;
}

.more-stories:hover {
  background-color: #0AA8D3;
}

.fadeInUp {
  -webkit-animation-duration: 1.6s;
  -webkit-animation-delay: .66s;
}

.bg-img {
  transform: scale(1.0, 1.0);
  background: no-repeat center center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  filter: blur(0px)
}

.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

#body-img {
  height: 200px;
  width: 100%;
  background: no-repeat center center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

.flex-container {
  padding: 0;
  margin: 0;
  list-style: none;

  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;

  -webkit-flex-flow: row wrap;
  justify-content: space-around;
}

.hidden {
  display: none;
}

.stop-scrolling {
  overflow: hidden;
}

.flex-item {
  background: tomato;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
