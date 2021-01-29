<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="clearQuery"
            @keydown.enter.native="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"
          ><el-button type="primary" @click="addGoods"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <el-table :data="goodslist" row-key="goods_id" border>
        <el-table-column
          type="index"
          :index="setTableIndex"
          label="序号"
          width="80"
        >
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px">
        </el-table-column>
        <el-table-column
          prop="goods_number"
          label="商品重量（克）"
          width="120px"
        >
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="240px">
          <template v-slot="scope">
            {{ scope.row.add_time | dataFormat }}
          </template></el-table-column
        >
        <el-table-column label="操作" width="250px"
          ><template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeGoods(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column></el-table
      >
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      goodslist: [],
    }
  },

  created() {
    this.getGoodsList()
  },

  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品列表失败')
      this.$message.success('获取商品列表成功')
      console.log(res)
      this.goodslist = res.data.goods
      this.total = res.data.total
      this.setTableIndex(this.goodslist)
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    /* 让每页的序号连续 */
    setTableIndex(index) {
      return (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize + index + 1
    },
    clearQuery() {
      this.queryInfo.query = ''
      this.getGoodsList()
    },
    async removeGoods(row) {
      const confirResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirResult !== 'confirm') {
        this.$message({
          type: 'info',
          message: '已取消删除',
        })
        return
      }
      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getGoodsList()
    },
    addGoods(){
        this.$router.push('/goods/add')
    }
  },
}
</script>

<style lang="less">
</style>