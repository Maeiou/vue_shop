<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="true"
        show-icon
      >
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态属性" name="many"
          ><el-button
            type="primary"
            :disabled="selectedKeys.length < 3"
            @click="addOrEditForms = true"
            >添加参数</el-button
          >
          <el-table :data="manyTabData" border>
            <!-- 展开 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  :key="index"
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  @close="handleClosed(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>

            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editForm(scope.row.attr_id)"
                  >编辑</el-button
                ><el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only"
          ><el-button
            type="primary"
            :disabled="selectedKeys.length < 3"
            @click="addOrEditForms = true"
            >添加属性</el-button
          ><el-table :data="onlyTabData" border>
            <!-- 展开 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  :key="index"
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  @close="handleClosed(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template></el-table-column
            >
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>

            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editForm(scope.row.attr_id)"
                  >编辑</el-button
                ><el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数 编辑 都使用同一对话框 -->
    <el-dialog
      :title="titleText1 + titleText2"
      :visible.sync="addOrEditForms"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addOrEditForm"
        :rules="addOrEditFormRules"
        ref="addOrEditFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText2" prop="attr_name">
          <el-input v-model="addOrEditForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditOrAdd">取 消</el-button>
        <el-button type="primary" @click="addOrEditCateAttr">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      selectedKeys: [],
      activeName: 'many',
      manyTabData: [],
      onlyTabData: [],
      addOrEditForms: false,
      addOrEditForm: {},
      addOrEditFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
      addOrEdit: 'add',
      inputVisible: false,
      inputValue: '',
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败')
      this.$message.success('获取商品分类成功')
      this.catelist = res.data
      console.log(this.catelist)
    },
    handleChanged() {
      this.getParamsData()
    },
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return console.log(this.selectedKeys)
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      console.log(res)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(this.activeName)
      if (res.meta.status !== 200)
        return this.$message.error('获取参数列表失败')
      this.$message.success('获取参数列表成功')
      if ((this, this.activeName === 'many')) {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addOrEditFormRef.resetFields()
    },
    async addOrEditCateAttr() {
      /* 判断是添加还是修改 */
      if (this.addOrEdit === 'add') {
        /* 添加参数 */
        this.$refs.addOrEditFormRef.validate((valid) => {
          if (!valid) return
        })
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addOrEditForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201)
          return this.$message.error('添加参数列表失败')
        this.$message.success('添加参数列表成功')
      } else {
        /* 提交编辑参数 */
        this.$refs.addOrEditFormRef.validate((valid) => {
          if (!valid) return
        })
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.addOrEditForm.attr_id}`,
          {
            attr_name: this.addOrEditForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('修改参数列表失败')
        this.$message.success('修改参数列表成功')
      }

      this.getParamsData()
      this.addOrEditForms = false
      this.addOrEdit = 'add'
    },
    /* 编辑参数 */
    async editForm(attr_id) {
      this.addOrEditForms = true
      this.addOrEdit = 'edit'
      console.log(this.activeName)
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          attr_sel: this.activeName,
        }
      )
      if (res.meta.status !== 200) return this.$message.error('查询参数失败')
      this.$message.success('查询参数成功')
      this.addOrEditForm = res.data
    },
    /* 删除参数 */
    async removeParams(attr_id) {
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    /* 点击显示文本输入框 */
    showInput(row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(','),
        }
      )
      if (res.meta.status !== 200) {
        /* 如果添加失败，则将添加的删除 */
        setTimeout(() => {
          row.attr_vals.pop()
        }, 1000);
        
        row.inputValue = ''
        row.inputVisible = false
        return this.$message.error('添加参数失败')
      } else {
        this.$message.success('添加参数成功')
      }

      row.inputValue = ''
      row.inputVisible = false
    },
    async handleClosed(index, row) {
      const vals = row.attr_vals.splice(index, 1)

      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(','),
        }
      )
      if (res.meta.status !== 200) {
        row.attr_vals.splice(index, 0, vals.join(''))
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
    },
    /* 关闭对话框后将状态重新赋值 */
    cancelEditOrAdd() {
      this.addOrEditForms = false
      /* 设置延迟， */
      setTimeout(() => {
        this.addOrEdit = 'add'
      }, 500)
    },
   
  },
  computed: {
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    /* 动态计算标题文本 */
    titleText2() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
    titleText1() {
      if (this.addOrEdit === 'add') {
        return '添加'
      } else {
        return '编辑'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px;
}
.input-new-tag {
  width: 90px !important;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>