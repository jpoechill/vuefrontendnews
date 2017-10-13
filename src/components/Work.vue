<template>
  <div style="margin-top: 60px;">
    <div v-for='(post, index) in list' v-bind:key='post.urlToImage' class='list-complete-item' style='min-height: 40px; height: 100%; margin-left: -20px; margin-top: 18px;'>
      <b-container>
        <b-row>
          <b-col class='flex-item' cols='4' style='background-color: #FFF; padding-left: 0px; padding-right: 0px; overflow: hidden;'>
            <a :href='post.url'>
              <a :href='post.url'>
                <div id='body-img' :style="{ backgroundImage: `url('${post.urlToImage}')` }">
                </div>
              </a>
            </a>
          </b-col>
          <b-col cols='8' style=''>
            <div style='padding: 0px;'>
              <h4><a :href='post.url'>{{post.title}}</a></h4>
              <p style='font-size: 14px; margin-bottom: 10px;'>{{post.description}}</p>
              <p style=' margin-bottom: 10px; text-transform: uppercase; font-weight: 500; font-size: 12px;'>
                <i class='fa fa-heart-o' aria-hidden='true'></i>
                  {{post.author}} |
                <!-- <i class='fa fa-share' aria-hidden='true'></i> -->
                  <i>{{ post.publishedAt }}</i>
              </p>
              <a  v-for='vendor in post.vendors' class='homepage-link' :href='vendor.homepage' style='margin-right: 14px;'>
                <span>
                  {{vendor.name}}
                </span>
              </a>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hello',
  props: ['list']
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
