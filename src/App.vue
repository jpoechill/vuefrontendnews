<template >
  <div style="margin-bottom: 14px;" v-bind:class="{ 'stop-scrolling': !busy }">
    <header>
      <div style="position: fixed; z-index: 10; width: 100%; background-color: #111;">
        <b-container>
          <b-row>
              <b-col class="icon-bg" cols="1" style="max-width: 100%; padding-bottom: 9px; margin-top: -2px; padding-top: 6px;">
                <div style="margin-left: 6px; padding-top: 3px; margin-top: 0px; padding-right: 4px;">
                  <router-link :to="{ path: '/'}" style="color: #FFF; text-decoration: none;">
                    <span style="font-size: 20px; font-weight: 700; margin-left: -10px; letter-spacing: 1.2px;">
                      FRONTENDR
                    </span>
                  </router-link>
                </div>
              </b-col>
              <b-col style="margin-left: -4px; padding-top: 8px;">
                <div>

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

      promises = self.urlVendors.map((site) => {
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
              item.isVisible = false

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
        var bufferLength = self.buffer.length

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

        this.posts.map((item, index) => {
          if (index < 4) {
            item.isVisible = true
          } else {
            item.isVisible = false
          }
          return item
        })
      })
    },
    vendorIsClicked: function (vendor) {
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
      if (this.posts.length < 9) {
        var postsLengthCurr = self.posts.length
        var totalVisibleLessPostsLength = 8 - this.posts.length
        for (let i = 0; i < totalVisibleLessPostsLength; i++) {
          var bufferIndexToAdd = postsLengthCurr + i
          if (bufferIndexToAdd < this.buffer.length) {
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

        // Append to cookies
        var sources = this.$cookie.get('activeSources').split(',')
        sources.push(vendor.siteURL)
        this.$cookie.set('activeSources', sources, 7)

        this.fetchArticles()
      } else {
        vendor.isClicked = false

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
      var cookies = this.$cookie.get('activeSources')

      if (cookies === null) {
        this.$cookie.set('activeSources', ['the-verge', 'recode'], 7)
      } else {
        var sources = this.$cookie.get('activeSources').split(',')

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

      // Add stories from buffer,
      // and remove button if no more stories to show
      if (self.posts.length + 8 > bufferLength) {
        self.makeHidden()
      } else {
        self.makeVisible()
      }

      if (baseLength < (bufferLength)) {
        // Add stories
        for (let i = 0; i < 8; i++) {
          if ((posts.length) < buffer.length) {
            posts.push(buffer[baseLength + i])
          }
        }
      }
    },
    toggleLike: function (index) {
      this.posts[index].isLiked = !this.posts[index].isLiked
    },
    makeHidden: function () {
      this.isHidden = true
    },
    makeVisible: function () {
      this.isHidden = false
    },
    showMore: function (numToShow) {
      var indexLastShown = 0

      this.posts.map((item, index) => {
        if (item.isVisible === true) {
          indexLastShown = index
        }

        if (index <= (indexLastShown + numToShow)) {
          item.isVisible = true
        }
        return item
      })
    }
  },
  created () {
    var self = this
    this.handleCookies()
    this.fetchArticles()

    console.log('Created')
    window.document.body.onscroll = function (point) {
      var windowHeight = window.document.documentElement.clientHeight
      var pageHeight = window.document.body.scrollHeight
      var maxPageHeight = (pageHeight - windowHeight)
      var scrollPosition = window.scrollY
      console.log(scrollPosition + ' of ' + maxPageHeight)

      window.document.body.onscroll = function (point) {
        var windowHeight = window.document.documentElement.clientHeight
        var pageHeight = window.document.body.scrollHeight
        var maxPageHeight = (pageHeight - windowHeight)
        var scrollPosition = window.scrollY - 50
        console.log(scrollPosition + ' of ' + maxPageHeight)

        if (scrollPosition >= (maxPageHeight - 60)) {
          self.showMore(1)
          console.log('Butt scroll')
        }
      }
    }
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

.hidden {
  display: none;
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
  transition: all .6s;
}
.list-leave-to /* .list-leave-active below version 2.1.8 */ {
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

#fadeInUp {
  -webkit-animation-delay: .8s;
  -moz-animation-delay: .8s;
  -o-animation-delay: .8s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40%, 0);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
</style>
