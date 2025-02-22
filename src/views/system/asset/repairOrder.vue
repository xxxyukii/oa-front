<template>
  <div class="app-container">
    <el-row :gutter="10">
      <head>
        <link rel="stylesheet" href="/iconfont.css" />
        npm
      </head>
      <i class="iconfont icon-&#xe60e;"></i>
      <el-button
        type="primary"
        icon="iconfont icon-&#xe60e;"
        size="mini"
        @click="handleOrder"
        >维修申请</el-button
      >
      <el-button type="primary">
        维修申请<i class="iconfont icon-&#xe60e;" style="margin-right: 8px"></i>
      </el-button>
    </el-row>

    <el-row :gutter="10">
      <!-- 2. 查询板块 -->
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
      >
        <el-form-item label="申请人">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px"
            prefix-icon="el-icon-search"
            @keyup.enter.native="handleQuery"
          ></el-input>
        </el-form-item>

        <el-form-item label="申请时间">
          <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </el-row>

    <!-- :visible.sync="dialogVisible" 
    来控制对话框的显示和隐藏。dialogVisible 是一个布尔值，决定对话框是否显示。 -->
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
      :before-close="handleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <!--  -->
            <el-form-item label="申请人" prop="userName">
              <el-input
                v-model="form.userName"
                placeholder="请输入"
                maxlength="30"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="隶属部门" prop="deptName">
              <el-input
                v-model="form.deptName"
                placeholder="请输入"
                maxlength="30"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!--  -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="申请日期" prop="repairDate">
              <el-date-picker
                v-model="form.repairDate"
                type="date"
                format="yyyy-MM-dd"
                placeholder="选择日期"
                style="width: 100%"
                :disabled-date="disabledDate"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择资产" prop="assetName">
              <el-autocomplete
                class="inline-input"
                v-model="form.assetName"
                :fetch-suggestions="querySearch"
                placeholder="模糊查询"
                :trigger-on-focus="false"
                @select="handleSelect"
              >
                <template v-slot:default="scope">
                  <span>{{ scope.item.value }}</span>
                  <span style="color: #999; font-size: 12px"
                    >{{ scope.item.assetId }})</span
                  >
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 维修原因 -->
        <el-row>
          <el-form-item label="维修原因">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入内容"
            ></el-input>
          </el-form-item>
        </el-row>

        <!-- 上传图片表单项 -->
        <el-row>
          <el-form-item label="上传图片" prop="imageUrl">
            <el-upload
              ref="upload"
              action=""
              :class="{ hideShow: hideUpload }"
              list-type="picture-card"
              :multiple="true"
              :on-exceed="onExceed"
              :on-remove="handleRemove"
              :limit="limit"
              :before-upload="beforeUpload"
              :http-request="uploadImage"
              :on-preview="handlePictureCardPreview"
            >
              <i slot="default" class="el-icon-plus"></i>
            </el-upload>
            <!-- 图片预览对话框 -->
            <el-dialog :visible.sync="dialogVisibleImg">
              <img width="100%" :src="imgUrl" />
            </el-dialog>
          </el-form-item>
        </el-row>

        <el-row>
          <!-- 是否换新 -->
          <el-col :span="12">
            <el-form-item label="是否更换产品">
              <el-select
                v-model="form.productChange"
                placeholder="选择产品"
                @change="handleProductChange"
              >
                <el-option
                  v-for="pc in this.Options"
                  :key="pc.value"
                  :label="pc.label"
                  :value="pc.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 如果更换产品为是/1 就把当前的产品库存 有无 显示出来 Y或者N（是/否） -->
          <el-col :span="12">
            <el-form-item label="更换产品" v-if="this.form.productChange === 1">
              <el-select
                v-model="form.isInStock"
                placeholder="库存有否"
                disabled
              >
                <el-option
                  v-for="item in this.stock"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 维修状态 -->
        <el-row>
          <el-form-item
            label="维修状态"
            prop="repairStatus"
            v-if="revealStatus"
          >
            <el-select
              v-model="form.repairStatus"
              placeholder="请选择状态"
              clearable
            >
              <el-option
                v-for="item in status"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-row>
      </el-form>
      <!-- slot="footer" 插槽，将按钮放入对话框的底部区域， -->
      <!-- 默认的 footer 插槽 允许你在对话框的底部自定义内容 -->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getInfo } from "@/api/login";
import {
  getUserAsset,
  updateQuantity,
  getAsset,
  updateAsset,
  addReapair,
  uploadFiles,
} from "@/api/system/asset";
export default {
  name: "repairOrder",
  data() {
    return {
      //:model="form"

      form: {},
      //是否更换
      Options: [
        { value: 1, label: "是" },
        { value: 2, label: "否" },
      ],
      //维修状态
      status: [
        { value: 1, label: "维修中" },
        { value: 2, label: "维修完成" },
      ],
      //是否在库
      stock: [
        { value: "Y", label: "在库" },
        { value: "N", label: "无库存" },
      ],
      //查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      // 显示搜索条件
      showSearch: true,
      // 选中的资产ID
      // 日期范围
      dateRange: [],
      selectedAssetId: null,

      assetList: [],
      //dialog 选择性展示
      revealStatus: false,
      // dialog弹框是否弹出
      dialogVisible: false,
      limit: 3, //最大上传数量
      dialogVisibleImg: false, // 控制预览对话框显示
      dialogImageUrl: "", // 当前预览图片的 URL
      disabled: false, // 控制是否禁用删除按钮
      fileList: [], //用来接收缓存中的图片
      imgUrl: "", // 图片地址
      imageUrl: [], // 这里存放所有图片的 URL
      //弹出层标题
      title: "",
      //:rules="rules"
      // rules 用于设置表单验证规则。你可以在 data 中定义一个规则对象，
      // 并在表单元素中通过 prop 属性来绑定字段名。这样当表单提交时，Vue 会自动根据这些规则来验证数据。
      rules: {
        userName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
      },
    };
  },
  created() {
    getInfo().then((response) => {
      console.log("getInfo", response);
      this.form.userName = response.user.userName;
      this.form.deptName = response.user.deptName;
      console.log(this.form.userName);
    });
  },
  // 上传超过限制后隐藏上传图标
  computed: {
    hideUpload() {
      console.log(this.fileList.length);
      console.log(this.limit);
      return this.fileList.length >= this.limit;
    },
  },
  mounted() {},
  methods: {
    reset() {
      this.form = {};
    },
    cancel() {
      this.dialogVisible = false;
      this.reset();
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
          this.reset();
        })
        .catch((_) => {});
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
    },
    disabledDate(date) {
      return date.getTime() < Date.now() - 8.64e7; // 禁用当前日期之前的日期
      // const today = new Date();
      // // 比较日期的时间戳
      // return date.getTime() < today.setHours(0, 0, 0, 0); // 禁用今天之前的日期
    },
    handleOrder() {
      // this.reset();
      // getInfo().then((response) => {
      //   console.log("getInfo", response);
      //   this.form.userName = response.user.userName;
      //   this.form.deptName = response.user.deptName;
      //   console.log(this.form.userName);
      // });
      this.dialogVisible = true;
      this.title = "物资维修申请单";
    },
    //确保 productChange 是 1 时，自动填充 isInStock
    //监听 productChange 变化，当它变为 1 时，从 this.stock 获取对应的值
    handleProductChange(value) {
      if (value === 1 && this.selectedAssetId) {
        //把选中的产品传输到这里

        console.log("查询库存", this.selectedAssetId);
        // 当选择 "是" 时，自动填充当前库存
        getAsset(this.selectedAssetId).then((response) => {
          console.log("查询库存", response.data);

          this.form.isInStock = response.data.isInStock;
          this.form.assetManagerId = response.data.assetManagerId;
          console.log("this.form.assetManagerId", this.form.assetManagerId);
          // console.log("this.form.isInStock", this.form.isInStock);

          //有时候 Vue 可能不会检测到它的变化，可以试着用 this.$set 手动更新它
          // this.$set(this.form, "isInStock", response.data.isInStock);
        });
      }
    },
    //模糊搜索出的用户资产信息
    handleSelect(item) {
      console.log(`选中：${item.value}, ID: ${item.assetId}`);
      this.form.assetName = item.value;
      this.form.assetId = item.assetId;
      // 选择资产时存储 assetId
      this.selectedAssetId = item.assetId;
    },
    //input搜索 模糊查询当前用户的资产列表
    querySearch(queryString, cb) {
      if (queryString) {
        console.log("queryString", queryString);
        getUserAsset(queryString)
          .then((response) => {
            cb(response.data);
          })
          .catch((error) => {
            this.$message("无数据", error);
            cb([]);
          });
      }
    },
    //删除上传的图片
    handleRemove(file, fileList) {
      const index = this.fileList.findIndex((item) => {
        return item.uid === file.uid;
      });
      this.fileList.splice(index, 1);
    },
    // 处理文件预览
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url; // 设置图片的 URL
      this.dialogVisibleImg = true; // 打开预览对话框
    },
    // 当前上传图片大小格式校验
    beforeUpload(file) {
      let fileArr = file.name.split(".");
      let suffix = fileArr[fileArr.length - 1];
      if (!/(jpg|jpeg|png|JPG|PNG|gif|GIF)/i.test(suffix)) {
        this.$message("图片格式不正确");
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.$message.warning("图片大小不能超过 10MB!");
        return false;
      }
      return true;
    },
    // 文件上传超出个数
    onExceed(files, fileList) {
      this.$message(`最多上传 ${this.limit} 张图片`);
    },
    // 文件变动时的处理事件函数 x
    handleFileChange(file, fileList) {
      console.log("上传时的动作");
      console.log(file, fileList);
      console.log(file.raw);
      this.fileList = fileList; //每一个改变都会将el-upload里面的图片传递的参数复制到this.filelist去
      this.uploadImage();
    },
    // 手动上传图片
    uploadImage(file) {
      console.log("file", file);
      // 主要用于构建一个 multipart/form-data 请求，这是一种常用于文件上传的 HTTP 请求方式。
      // 使用 FormData，你可以将多个字段（包括文件）作为表单数据发送到后端，而无需重新编写整个表单。
      const formData = new FormData();
      formData.append("image", file.file);

      uploadFiles(formData)
        .then((response) => {
          // this.fileList.push({
          //   uid: file.file.uid,
          //   url: response.data,
          // });
          console.log(this.fileList);
          // 假设返回的数据中包含图片的 URL

          // 存储所有上传成功的图片 URL
          // if (!this.form.imageUrl) {

          // }
          this.form.imageUrl = [];
          console.log("jieguo", response);
          this.imageUrl.push(response.msg); // 如果是多个图片，推入数组
          console.log("jieguo2", response.msg);
          this.form.imageUrl = this.imageUrl.join(","); // 最后将其合并成字符串
          console.log("tu", this.imageUrl);
          console.log("fenge", this.form.imageUrl);
          // this.form.imageUrl = response.data.msg;
          // this.fileList.push(imageUrl)
          this.$message.success("上传成功");
        })
        .catch((error) => {
          console.log("error", error);
          this.$message.error("上传失败", error);
        });
    },

    //提交申请单
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          //如果是否更换条件为ture/1 更换产品 则在库存里减库存
          if (this.form.productChange === 1) {
            //还要先检查是否有库存 /还是说 如果没有库存直接不显示可换的
            console.log("this.form.productChange", this.form.productChange);
            try {
              updateQuantity({ assetId: this.form.assetId }).then(
                (response) => {
                  console.log("this.form.assetId", this.form.assetId);
                  this.$modal.msgSuccess("修改成功");
                  this.reset();
                  this.dialogVisible = false;
                }
              );
            } catch (error) {
              this.$message("库存更新失败", error);
            }
          }
          // 假设 imageUrl 是要提交到后端的字段

          // 这里提交表单时，可以把 imageUrl 加入表单数据中
          // **如果 imageUrls 是数组，就直接 join(",")**
          // **创建一个新对象，避免修改 this.form**
          // const formData = {
          // ...this.form, // 复制所有字段
          // imageUrl: this.form.imageUrl.join(","), // **单独处理 imageUrls**
          // };
          // this.form.imageUrl = this.form.imageUrl.join(",");
          this.form.userId = this.$store.state.user.id;
          console.log("this.form.imageUrl", this.form.imageUrl);
          // 获取设备所属管理员 ID
          getAsset(this.form.assetId).then((response) => {
            this.form.assetManagerId = response.data.assetManagerId;
            console.log("this.form.assetManagerId", this.form.assetManagerId);
          });

          addReapair(this.form)
            .then((response) => {
              this.$message.success("提交成功");
              console.log("上传成功", response.data);
              this.dialogVisible = false;
            })
            .catch((error) => {
              console.log("提交失败", error);
              this.$message.error("提交失败");
            });
        } else {
          this.$message.error("请先上传图片或者检查表单填写");
        }
      });
    },
  },
};
</script>

<style scoped>
/* 上传超过限制后隐藏上传图标 */
.hideShow .el-upload--picture-card {
  display: none;
}
</style>
