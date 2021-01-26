<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <el-table
        :data="catelist"
        row-key="cat_id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column type="index" label="序号" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.index }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cat_name" label="分类名称"> </el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <template v-slot="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.cat_deleted === false"
              style="color: lightgreen"
            ></i>
            <i class="el-icon-error" v-else style="color: red"></i>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序">
          <template v-slot="scope">
            <el-tag v-if="scope.row.cat_level === 0"> 标签一</el-tag>
            <el-tag type="success" v-if="scope.row.cat_level === 1"
              >标签二</el-tag
            >
            <el-tag type="info" v-if="scope.row.cat_level === 2">标签三</el-tag>
            <el-tag type="warning" v-if="scope.row.cat_level === 3"
              >标签四</el-tag
            >
          </template></el-table-column
        >
        <el-table-column label="操作"
          ><el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      title="添加表单分类"
      :visible.sync="addCateDialog"
      width="30%"
      @close="addCateDialogClosed"
    >
      <!-- 添加表单分类 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 100,
      },
      //商品分类
      catelist: [],
      total: 0,
      addCateDialog: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      //父级分类列表
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true',
      },
      selectedKeys: [],
      
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败')
      this.$message.success('获取商品分类成功')
      console.log(res)
      this.catelist = res.data.result
      this.total = res.data.total

      this.setTableIndex(this.catelist)
    },

    // 树形列表index层级，实现方法
    setTableIndex(arr, index) {
      arr.forEach((item, key) => {
        item.index = key + 1

        if (index) {
          item.index = index + '-' + (key + 1)
        }
        if (item.children) {
          this.setTableIndex(item.children, item.index)
        }
      })
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialog = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取父级分类失败')
      this.$message.success('获取父级分类成功')
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    async parentCateChanged() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类分类成功')
        this.getCateList()
        this.addCateDialog = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
    },
   
  },
}
</script>

<style lang="less">
</style>