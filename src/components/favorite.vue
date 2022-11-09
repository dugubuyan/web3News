<template>
<div>
  <el-card>
    <div slot="header" class="clearfix">
      <span>您关注的大神（连接钱包后再次刷新出现）</span>
      <el-button style="float: right; padding: 3px 0" type="text" @click="getAllFriends">刷新</el-button>
      <el-button style="float: right; padding: 3px 0" type="text" @click="clearAllFriends">清除所有</el-button>
    </div>
    <el-table :data="friends" border>
      <el-table-column label="姓名" prop="name"/>
      <el-table-column label="网站地址" prop="website"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
              type="primary"
              @click="clearFriend(scope.row.name)">取消关注</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
<el-card style="margin-top: 10px">
  <div slot="header" class="clearfix">
    <span>用户列表</span>
  </div>
  <el-table :data="allUsers" border>
    <el-table-column label="姓名" prop="name"/>
    <el-table-column label="网站地址" prop="website">
      <template slot-scope="scope"><a :href="scope.row.website" target="_blank">{{ scope.row.website }}</a></template>
    </el-table-column>
    <el-table-column label="操作">
    <template slot-scope="scope">
      <el-button
          type="primary"
          @click="addFriend(scope.row.name)">关注</el-button>
    </template>
    </el-table-column>
  </el-table>
</el-card>
</div>
</template>

<script>
import {addMyFriend, clearALlFriends, clearMyFriend, getFriends, getUsers} from "@/components/HelloWorld";

export default {
  name: "favorite",
  mounted() {
    this.allUsers = []
    getUsers().then(res=>{
      for(const i in res){
        this.allUsers.push(res[i])
      }
      console.log(this.allUsers)
    }),
    getFriends().then(res=>{
      for(const name in res){
        this.friends.push(res[name])
      }
    })
  },
  data() {
    return {
      friends: [
      ],
      allUsers: []
    }
  },
  methods:{
    addFriend(item) {
      console.log(item)
      addMyFriend(item).then(()=>{
        this.$message({
          message: '恭喜你，添加成功',
          type: 'success'
        });
      })
    },
    clearFriend(name){
      clearMyFriend(name).then(()=>{
        this.$message({
          message: '您已取消关注',
          type: 'success'
        });
      })
    },
    getAllFriends() {
      this.friends = []
      getFriends().then(res=>{
        for(const name in res){
          this.friends.push(res[name])
        }
      })
    },
    clearAllFriends() {
      clearALlFriends().then(()=>{
        this.$message({
          message: '清理成功',
          type: 'success'
        });
      })
    }
  }
}
</script>

<style scoped>

</style>