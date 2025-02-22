<template>
  <div>
    <el-dialog
      title="修改资产管理"
      :visible.sync="open"
      width="600px"
      append-to-body
    >
      <el-button @click="closeDialog">取消</el-button>
      
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:open", false); // 关闭对话框
    },
  },
};
</script>

<style></style>
