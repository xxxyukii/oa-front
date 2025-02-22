<template>
<div>
  <el-drawer
    title="选择部门/员工参会人员"
    :visible.sync="drawerVisible" 
    :with-header="false"
    append-to-body
  >
  <!-- 通过 v-bind :   将 drawerVisible 双向绑定到组件的 visible 属性。
  这样父组件控制 drawerVisible，子组件能够控制 drawerVisible 的变化，并同步更新。 -->
  <!-- .sync 修饰符在 Vue 2 中允许你实现父子组件之间的双向绑定。 -->
  <!-- Vue 会自动将 :open.sync="open" 转换为：
:open="open" @update:open="value => open = value" -->
    <el-tree
      lazy
      show-checkbox
      node-key="key"
      :check-strictly="true"
      :highlight-current="true"
      :load="loadDeptData"
      :props="deptProps"
      :default-checked-keys="defaultCheckedIds"
      @check="treeCheck"
    >
    <!-- :check-strictly="true" 启用严格的复选框选择模式，子节点与父节点的选中状态不会互相影响
        :load=  通过 loadDeptData 方法动态加载树的节点数据。
        :props="deptProps"： 树组件的属性，定义每个节点的属性名称，
        @check="treeCheck"：监听 el-tree 的 check 事件，即当树节点被选中时，触发 treeCheck 方法
    
    
     -->
    </el-tree>

    <el-button @click="closeDrawer">取消</el-button>
    <el-button type="primary" @click="confirmSelectionTree">确定</el-button>
  </el-drawer>
  </div>
</template>

<script>
import {  getDeptTree } from "@/api/system/dept";
export default {
  props: {
    //接收父组件传递的 drawerVisible，用来控制抽屉是否显示。
    drawerVisible: {
      type: Boolean, //this子组件必须要求父组件传过来的drawerVisible传过来的类型是Boolean，不然报错。如果不写type不报错，但就是不对，这样号查看bug
      required: true //是否必填
    },
    //接收父组件传递的默认选中节点 ID 的数组，用于在树形组件中预选中某些节点。
    defaultCheckedIds: {
      type: Array,
      default: () => [] //xx ?
    },
    //接收父组件传递的树形数据的属性配置
    deptProps: {
      type: Object,
      default: () => ({
         // 配置 Tree 组件的显示属性
        label: 'label',  // 节点标签字段
        isLeaf: 'isLeaf',  // 判断是否为叶子节点
      })
    }
  },
  data() {
    return {
      //存储选中的节点信息，初始化为空数组。当用户勾选树节点时，这个数组会存储勾选的节点数据。
      checkedNodes: []
    };
  },
  methods: {
    closeDrawer() {
      this.$emit('update:drawerVisible', false);  // 使用 .sync 修饰符时，通过事件修改父组件的值
    },
    
     // 处理树形节点的勾选
    treeCheck(currNode, { checkedKeys, checkedNodes }) {
      console.log(currNode);
      console.log({ checkedKeys, checkedNodes });
      this.checkedNodes = checkedNodes;  // 存储选中的节点
    },
    confirmSelectionTree() {
      this.$emit('update:checkedAttendees', this.checkedNodes);  // 将选中的节点传递给父组件
      this.closeDrawer();
    },
    // 加载部门树数据
    loadDeptData(node, resolve) {
      // 判断当前节点是否是叶子节点，如果是叶子节点就不进行懒加载
      // const deptId = node && node.id ? node.id : null;
      const deptId = node.data ? node.data.id : 0;
      // 加载子节点数据
      getDeptTree(deptId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve([]);
          console.error("加载子部门数据失败", error);
        });
    },
  }
};
</script>

<style scoped>

</style>
