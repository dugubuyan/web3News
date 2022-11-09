<template>
  <div>
    <el-container>
      <el-header>
        <div>
          <el-row>
            <el-col :span="8"><h1>欢迎进入发布系统 </h1></el-col>
            <el-col :span="8">&nbsp; &nbsp;</el-col>
            <el-col :span="8" v-if="this.didKey!== '' ">{{ didKey }}</el-col>
            <el-col :span="8" v-else style="float: right"><el-button style="float:right;margin-top: 15px" type="primary" @click="toAuth">connect</el-button></el-col>
          </el-row>
        </div>
      </el-header>
      <el-container>
        <el-aside>
          <el-menu
              default-active="1"
              class="el-menu-vertical-demo"
              @select="handleSelect">
            <el-menu-item index="1">
              <i class="el-icon-user-solid"></i>
              <span slot="title">首页</span>
            </el-menu-item>
            <el-menu-item index="2">
              <i class="el-icon-search"></i>
              <span slot="title">查询</span>
            </el-menu-item>
            <el-menu-item index="3">
              <i class="el-icon-collection"></i>
              <span slot="title">工作台</span>
            </el-menu-item>
            <el-menu-item index="4">
              <i class="el-icon-collection-tag"></i>
              <span slot="title">收藏夹</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <div v-if="pubVisible">
            <favorite/>

          </div>
          <div v-if="collectVisible">
            <el-row style="margin-bottom: 10px">
<!--              <el-button type="primary" @click="getChainfeeds">刷新</el-button>-->
<!--              <el-button type="primary" @click="getFromChainCatcher">ChainCatcher</el-button>-->
              <el-col :span="8"><el-button type="primary" @click="getChainfeeds">chainfeeds</el-button></el-col>
              <el-col :span="8"><el-button type="primary">链捕手</el-button></el-col>
              <el-col :span="8"><el-button type="primary">深潮</el-button></el-col>
<!--              <el-col :span="6" style="text-align: center"><el-button type="primary" @click="getChainfeeds">刷新</el-button></el-col>-->
            </el-row>
            <el-card v-for="item in chainFeeds" :key="item.uuid" style="margin-bottom: 10px">
              <div slot="header" class="clearfix">
                <span>{{ item.title }}</span>
                <div v-if="item.stared">
                  <el-button plain style="float: right; padding: 3px 0" icon="el-icon-star-on">已收藏</el-button>
                </div>
                <div v-else>
                  <el-button plain @click="favorite(item)" style="float: right; padding: 3px 0" icon="el-icon-star-off">收藏</el-button>
                </div>
              </div>
              <div>{{ item.abstract }}</div>
              <el-divider></el-divider>
              <el-row>
                <el-col :span="18">
                  <span>{{ item.author_name }}</span><el-divider direction="vertical"></el-divider>
                  <a :href="''+item.source_url">来源链接</a><el-divider direction="vertical"></el-divider>
                  <span>{{ item.show_time }}</span><el-divider direction="vertical"></el-divider>
                </el-col>
                <el-col :span="6" style="text-align: right">
                  <el-button icon="el-icon-edit" @click="dialogVisible = true">评论</el-button>
                </el-col>
<!--                <span>{{ item.author_name }}</span><el-divider direction="vertical"></el-divider>-->
              </el-row>
            </el-card>
          </div>
          <div v-if="queryVisible">
            <el-form status-icon label-width="100px" class="demo-ruleForm">
              <el-form-item label="StreamId" prop="pass">
                <el-input v-model="keyWords" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="query">确定</el-button>
                <el-button @click="clearArticle ">重置</el-button>
              </el-form-item>
            </el-form>
            <el-card v-if="articleVisible">
              <div slot="header" class="clearfix">
                <span>{{ article.name }}</span>
              </div>
              <el-tag>{{ article.author }}</el-tag>
              <div class="text item">{{ article.content }}</div>
            </el-card>
          </div>
          <div v-if="collectedVisible">
            <el-card v-for="item in collectedFeeds" :key="item.uuid" style="margin-bottom: 10px">
              <div slot="header" class="clearfix">
                <span>{{ item.title }}</span>
              </div>
              <div>{{ item.abstract }}</div>
              <el-divider></el-divider>
              <el-row>
                <el-col :span="18">
                  <span>{{ item.author_name }}</span><el-divider direction="vertical"></el-divider>
                  <a :href="''+item.source_url">来源链接</a><el-divider direction="vertical"></el-divider>
                  <span>{{ item.show_time }}</span><el-divider direction="vertical"></el-divider>
                </el-col>
                <el-col :span="6" style="text-align: right">
                  <span>2022-09-09</span>
                </el-col>
              </el-row>
            </el-card>
          </div>
          <el-dialog
              title="提示"
              :visible.sync="dialogVisible"
              width="30%">
            <el-input rows="5" type="textarea" placeholder="请输入评论"/>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
          </el-dialog>
        </el-main>
      </el-container>
      <el-dialog title="收藏"
                 :visible.sync="pubFavoriteVisible"
                 width="60%">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="来源链接">
            <el-input v-model="form.source_url"/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="form.title"/>
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="form.author_name"/>
          </el-form-item>
          <el-form-item label="摘要">
            <el-input v-model="form.abstract" type="textarea" :autosize="{ minRows: 5, maxRows: 10}"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publish(form)">发布</el-button>
            <el-button type="cancel" @click="pubFavoriteVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import {loadDocument, auth, createDocument, tryAuthenticate, getDid, collect, getCollectedInfo} from './HelloWorld'
import {get, getFromChainCatcher} from '../api/request'
import {dateFormat} from "@/api/utils";
import Favorite from "@/components/favorite";
export default {
  name: 'HelloWorld',
  components: {Favorite},
  created() {
    // const did = getDid()
    // this.didKey = did.id
  },
  data() {
    return {
      didKey : '',
      pubVisible: true,
      queryVisible: false,
      collectVisible: false,
      collectedVisible: false,
      pubFavoriteVisible: false,
      form :{
        title: '',
        author_name: '',
        abstract: '',
        source_url: '',
        uuid: '',
        show_time: ''
      },
      authors: [
        {
          label: '鲁迅',
          name: '鲁迅'
        },
        {
          label: '莫言',
          name: '莫言'
        },
        {
          label: '金庸',
          name: '金庸'
        }
      ],
      currentItem : {},
      streamIds: [],
      keyWords: '',
      articleVisible :false,
      article :{
        name: '',
        author: '',
        content: ''
      },
      chainFeeds:[],
      dialogVisible :false,
      collectedFeeds: []
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      if( key === '1'){
        this.pubVisible = true
        this.queryVisible = false
        this.collectVisible = false
        this.collectedVisible = false
      } else if(key === '2'){
        // loadDocument('kjzl6cwe1jw147jx2oie8zvmutyeu7appqezfbt56qc16wllmqoy8p107x0syno').then(loadDoc=>{
        //   console.log("anchorCommitIds --------> " + loadDoc.anchorCommitIds)
        //   console.log("last commit --------> " + loadDoc.commitId)
        //   console.log(loadDoc.content)
          this.queryVisible = true
          this.pubVisible = false
          this.collectVisible = false
          this.collectedVisible = false
        // })
        // console.log(this.streamIds)
      } else if (key === '3') {
        this.queryVisible = false
        this.pubVisible = false
        this.collectVisible = true
        this.collectedVisible = false
      } else if (key === '4') {
        this.getCollected()
        this.queryVisible = false
        this.pubVisible = false
        this.collectVisible = false
        this.collectedVisible = true
      }
    },
    publish () {
      const content = {'title': this.form.title, 'author': this.form.author, 'abstract': this.form.content}
      collect(this.form).then(()=>{
        this.currentItem.stared = true
        this.$message({
          message: '收藏成功',
          type: 'success'
        });
        this.pubFavoriteVisible = false
      })
      // // The stream ID of the created document can then be accessed as the `id` property
      // createDocument(content).then(doc=>{
      //   console.log(doc.id.toString())
      //   this.streamIds.push(doc.id.toString())
      //   this.$message({
      //     showClose: true,
      //     message: '发布成功: '+ doc.id.toString(),
      //     type: 'success'
      //   })
      // })
    },
    query (){
      loadDocument(this.keyWords).then(loadDoc=>{
        console.log("anchorCommitIds --------> " + loadDoc.anchorCommitIds)
        console.log("last commit --------> " + loadDoc.commitId)
        console.log(loadDoc.content)
        console.log(this.streamIds)
        this.articleVisible = true
        this.article = loadDoc.content
      })
    },
    clearArticle() {
      this.keyWords=''
      this.article = {}
    },
    toAuth() {
      tryAuthenticate().then(did=>{
        console.log(did)
        this.didKey = did.id
      })
      console.log(this.didKey)
    },
    getChainfeeds(){
      get("https://api.chainfeeds.xyz/feed/list?page=1&page_size=10&group_alias=selected").then(data=>{
        console.log(data)
        if(data.code === 0){
          for(const i in data.data.list ){
            data.data.list[i].show_time = dateFormat(data.data.list[i].show_time)
            data.data.list[i].stared = false
          }
          this.chainFeeds = data.data.list
        }
      })
    },
    getFromChainCatcher(){
      getFromChainCatcher()
    },
    favorite(item) {
      this.pubFavoriteVisible = true
      this.currentItem = item
      this.form = item
    },
    getCollected() {
      getCollectedInfo().then(res=>{
        if( 'logout' === res){
          this.$message({
            showClose: true,
            message: 'please login first, or we do not know what you have collected',
            type: 'error'
          });
        }else{
          this.collectedFeeds = res
          console.log(this.collectedFeeds)
        }
      })
    }
  }
}
</script>
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
</style>
