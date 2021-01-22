<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary">添加角色</el-button>
      <!-- 用户列表 -->
      <el-table :data="rolesList" border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              class="elcenter"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbpttom', index1 === 0 ? 'bdtop' : 'bdbpttom']"
            >
              <!-- 一级权限 -->
              <el-col :span="5"
                ><el-tag closable="">{{ item1.authName }}</el-tag
                ><i class="el-icon-caret-right"></i
              ></el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'bdtop']"
                >
                  <el-col :span="6"
                    ><el-tag type="success" closable="">{{
                      item2.authName
                    }}</el-tag
                    ><i class="el-icon-caret-right"></i
                  ></el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18"
                    ><el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    ></el-col
                  >
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialo(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="提示"
      :visible.sync="setRightDialo"
      width="50%"
      @close="setRightDialoClosed"
    >
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialo = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      setRightDialo: false,
      rightList: [],
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      defKeys: [],
      //即将分配权限的角色id
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
      console.log(res)
    },
    async removeRightById(roles, id2) {
      //弹框询问
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      //删除返回confirm  取消返回cancel
      if (confirmResult !== 'confirm') return this.$message.info('已经取消删除')
      const { data: res } = await this.$http.delete(
        'roles/' + roles.id + '/rights/' + id2
      )
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')

      roles.children = res.data
    },
    async showSetRightDialo(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.$message.success('获取数据用户成功')
      console.log(res)
      this.rightList = res.data
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialo = true
    },
    getLeafKeys(node, arr) {
      //判断node节点有没有childre属性
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    setRightDialoClosed() {
      this.defKeys = []
    },
    async allotRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids:idStr})
      
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.$message.success('获取数据用户成功')
      this.getRolesList()
      this.setRightDialo = false
    },
  },
}
</script>

<style lang="less">
.elcenter {
  display: flex;
  align-items: center;
}
</style>