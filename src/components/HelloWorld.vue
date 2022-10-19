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
              <i class="el-icon-edit"></i>
              <span slot="title">发布</span>
            </el-menu-item>
            <el-menu-item index="2">
              <i class="el-icon-search"></i>
              <span slot="title">查询</span>
            </el-menu-item>
            <el-menu-item index="3">
              <i class="el-icon-collection-tag"></i>
              <span slot="title">收藏</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <div v-if="pubVisible">
            <el-form ref="form" :model="form" label-width="80px">
              <el-form-item label="名称">
                <el-input v-model="form.name"/>
              </el-form-item>
              <el-form-item label="作者">
                <el-select v-model="form.author" placeholder="请选择作者">
                  <el-option
                      v-for= "author in authors"
                      :key="String(author.name)"
                      :label= "String(author.label)"
                      :value="String(author.name)" />
                </el-select>
              </el-form-item>
              <el-form-item label="内容">
                <el-input v-model="form.content" type="textarea" :autosize="{ minRows: 5, maxRows: 10}"/>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="publish(form)">发布</el-button>
                <el-button type="cancel">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-if="collectVisible">
            <el-card>

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
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import {loadDocument, auth, createDocument, tryAuthenticate, getDid} from './HelloWorld'
export default {
  name: 'HelloWorld',
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
      form :{
        name: '',
        author: '',
        content: ''
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
      streamIds: [],
      keyWords: '',
      articleVisible :false,
      article :{
        name: '',
        author: '',
        content: ''
      },
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      if( key === '1'){
        this.pubVisible = true
        this.queryVisible = false
        this.collectVisible = false
      } else if(key === '2'){
        loadDocument('kjzl6cwe1jw147jx2oie8zvmutyeu7appqezfbt56qc16wllmqoy8p107x0syno').then(loadDoc=>{
          console.log("anchorCommitIds --------> " + loadDoc.anchorCommitIds)
          console.log("last commit --------> " + loadDoc.commitId)
          console.log(loadDoc.content)
          this.queryVisible = true
          this.pubVisible = false
          this.collectVisible = false
        })
        console.log(this.streamIds)
      } else if (key === '3') {
        this.queryVisible = false
        this.pubVisible = false
        this.collectVisible = true
      }
    },
    publish (form) {
      const content = {'name': form.name, 'author': form.author, 'content': form.content}
      // The stream ID of the created document can then be accessed as the `id` property
      createDocument(content).then(doc=>{
        console.log(doc.id.toString())
        this.streamIds.push(doc.id.toString())
        this.$message({
          showClose: true,
          message: '发布成功: '+ doc.id.toString(),
          type: 'success'
        })
      })
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
