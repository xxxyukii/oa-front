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
            v-model="queryParams.repairDate"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="date"
          ></el-date-picker>
        </el-form-item>

        <!-- 订单状态 -->
        <el-form-item label="订单状态" prop="repairStatus">
          <el-select
            v-model="queryParams.repairStatus"
            placeholder="请选择订单状态"
            clearable
          >
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>

        <!-- 2-2.搜索重置小按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </el-row>

    <el-table
      v-loading="loading"
      :data="filteredRepairData"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" align="center">
      </el-table-column>
      <el-table-column
        label="申请人"
        align="center"
        prop="userName"
        width="80"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column
        label="申请时间"
        align="center"
        prop="repairDate"
        width="100"
        show-overflow-tooltip
      >
        <!-- parseTime 解析和格式化时间的库 parseTime将日期字符串转换为JavaScript中的Date对象  自定义格式（如“YYYY-MM-DD HH:mm”）-->
        <!-- <template slot-scope="scope">
          <span>{{ parseTime(scope.row.repairDate) }}</span>
        </template> -->
      </el-table-column>
      <el-table-column
        label="资产名称"
        align="center"
        prop="assets.assetName"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="故障现象"
        align="center"
        prop="description"
        width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="维修状态"
        align="center"
        prop="repairStatus"
        width="160"
      >
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.repairStatus === 0
                ? ''
                : scope.row.repairStatus === 1
                ? 'warning'
                : 'success'
            "
            size="mini"
          >
            <span>{{ getStatusLabel(scope.row.repairStatus) }}</span>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        v-if="roleId === 1 || roleId === 3"
        label="资产负责人"
        align="center"
        prop="assets.assetManagerName"
        width="80"
        show-overflow-tooltip
      />

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="180"
      >
        <template slot-scope="scope">
          <div style="display: flex; gap: 10px; justify-content: center">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleExamine(scope.row)"
              v-if="scope.row.repairStatus === 0"
              >维修</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleComplete(scope.row)"
              v-else-if="scope.row.repairStatus === 1"
              >维修完成</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleComplete(scope.row)"
              v-else-if="scope.row.repairStatus === 2"
              >确认</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleDetails(scope.row)"
              >工单详情</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <!-- import Pagination from "@/components/Pagination"; -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

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
        
          <!-- 如果更换产品为是/1 就把当前的产品库存 有无 显示出来 Y或者N（是/否） -->
          <el-col :span="12">
            <el-form-item label="更换产品" v-if="[1,2,3,4].includes(form.repairStatus)">
              <el-select
                v-model="form.isInStock"
                placeholder="库存有否"
                :disabled="1 !== form.repairStatus ? true : false"
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
          <el-form-item v-if="[1,2,3,4].includes(form.repairStatus)"
            label="维修方式"
            prop="repairMethod"
          >
            <el-select
              v-model="form.repairMethod"
              placeholder="请选择维修方式"
              clearable
                :disabled="1 !== form.repairStatus ? true : false"
            >
              <el-option
                v-for="item in repairMethodOptions"
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
        <el-button type="primary" @click="submitRepairRequest">确 定</el-button>
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
import {
  repairList,
  getRepairOrder,
  handelRepairAction,
} from "@/api/system/repair";
export default {
  name: "repairOrder",
  data() {
    return {
      //:model="form"
      //维修申请单
      form: {},
      //维修人员审核单
      repairForm: {},
      //维修单数据
      repairData: [],
      radio: "1",
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
      //维修状态 map
      statusOptions: [
        { value: 0, label: "申请中" },
        { value: 1, label: "维修中" },
        { value: 2, label: "已维修" },
        { value: 3, label: "已确认" },
        { value: 4, label: "已更换" },
      ],
      // 维修人查看时添加的换新或维修状态
      repairMethodOptions: [
        { value: 0, label: "换新" },
        { value: 1, label: "维修" },
        { value: 2, label: "已维修" },
        { value: 3, label: "报废" },
      ],
      //查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        repairStatus: 0,
        userName: undefined,
        repairDate: undefined,
      },
      // 总条数
      total: 0,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multipleSelction: true,
      // 显示搜索条件
      showSearch: true,
      // 选中的资产ID
      selectedAssetId: null,
      //审核按钮 绑定
      repairStatus: 1,
      //审核 备注
      remark: "",
      //审核按钮 被选中的那一行数据
      rowExamine: {},
      assetList: [],
      //dialog 选择性展示
      revealStatus: false,
      // 是否显示审核弹出层
      showRepairmanDialog: false,
      // dialog弹框是否弹出
      dialogVisible: false,
      limit: 3, //最大上传数量
      dialogVisibleImg: false, // 控制预览对话框显示
      //维修人员 维修操作 弹框
      repairCompleteDialog: false,
      dialogImageUrl: "", // 当前预览图片的 URL
      disabled: false, // 控制是否禁用删除按钮
      fileList: [], //用来接收缓存中的图片
      imgUrl: "", // 图片地址
      imageUrl: [], // 这里存放所有图片的 URL
      //弹出层标题
      title: "",
      roleId: "",

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
      this.form.userId = response.user.userId;
      // this.form.roleId = response.user.roles[0].roleId;
      this.roleId = response.user.roles[0].roleId;

      console.log("roleId", this.roleId);
      this.form.deptName = response.user.deptName;

      console.log(this.form.userName);
    });
    this.getList();
  },

  computed: {
    // 上传超过限制后隐藏上传图标
    hideUpload() {
      console.log(this.fileList.length);
      console.log(this.limit);
      return this.fileList.length >= this.limit;
    },
    //  根据角色过滤数据
    filteredRepairData() {
      const roleId = this.roleId;
      const userId = this.$store.state.user.id;
      if (roleId === 1 || roleId === 3) {
        return this.repairData; // 超级管理员看到所有数据
      } else if (roleId === 2) {
        return this.repairData.filter((item) => item.userId === userId); // 申请者只看到自己提交的任务
      } else {
        return []; // 其他角色返回空数据
      }
    },
  },
  mounted() {},
  methods: {
    reset() {
      this.form = {
        userName: undefined,
        repairDate: undefined,
      };
      this.resetForm("form"); //表单重置 ruoyi.js
      // 表单重置
      // export function resetForm(refName) {
      //   if (this.$refs[refName]) {
      //     this.$refs[refName].resetFields();
      //   }
      // }
    },
    cancel() {
      this.dialogVisible = false;
      this.reset();
    },
    //弹框关闭提示
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
          this.reset();
        })
        .catch((_) => {});
    },
    // 审核弹框取消按钮
    cancelExamine() {
      this.showRepairmanDialog = false;
      this.resetExamine();
    },
    //维修人员 维修操作取消按钮
    cancelComplete() {
      this.repairCompleteDialog = false;
      this.reset();
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.userName = undefined;
      this.handleQuery();
    },
    // 表单重置
    resetExamine() {
      this.repairStatus = "1"; // 默认通过
    },
    //多选框选中数据
    handleSelectionChange(selection) {
      console.log(selection);
      this.ids = selection.map((item) => item.rapairId);
      this.single = selection.length != 1; //只要是选中了1条以上 修改按钮就得禁用
      this.multiple = !selection.length;
    },
    disabledDate(date) {
      return date.getTime() < Date.now() - 8.64e7; // 禁用当前日期之前的日期
      // const today = new Date();
      // // 比较日期的时间戳
      // return date.getTime() < today.setHours(0, 0, 0, 0); // 禁用今天之前的日期
    },

    //审核状态
    getStatusLabel(status) {
      // 根据状态值获取对应的文本标签
      const option = this.statusOptions.find((item) => item.value === status);
      return option ? option.label : "未知状态";
    },
    //审核按钮操作
    handleExamine(row) {
      // this.$modal.confirm("row");
      console.log("row", row);
      this.rowExamine = row;
      this.showRepairmanDialog = true;
      const repairId = row.repairId;
      //根据row - repairId获取相应的详细信息
      this.getOrderByRow(row);
    },

    //根据row - repairId获取相应的详细信息
    getOrderByRow(row) {
      const repairId = row.repairId;
      getRepairOrder(repairId).then((response) => {
        this.form = response.data;
        this.form.assetName = response.data.assets.assetName;
      });
    },
    //维修人员点击维修完成
    handleComplete(row) {
      console.log("row", row);
      this.repairCompleteDialog = true;
      this.getOrderByRow(row); //根据row - repairId获取相应的详细信息
      this.title = "维修人员-维修操作";
    },
    getList() {
      console.log("getList启动了吗");
      this.loading = true;
      repairList(this.queryParams).then((response) => {
        this.repairData = response.rows;
        this.total = response.total;
        this.loading = false;
        this.form.roles = this.$store.state.user.roles; //xx想获取当前登录角色
        console.log("$store_roles", this.form.roles);
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal.confirm("row");
    },

    //订单详情
    handleDetails(row) {},
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
      // radio 无法得知当前焦点问题
      const radios = document.querySelectorAll(".el-radio__original");
      radios.forEach((radio) => {
        radio.removeAttribute("aria-hidden");
      });
      console.log("是否换111", this.repairForm.productChange);
      if (value === 1 && this.selectedAssetId) {
        console.log("查询库存", this.selectedAssetId);
        // 当选择 "是" 时，自动填充当前库存
        getAsset(this.selectedAssetId).then((response) => {
          console.log("查询库存", response.data);
          // this.form.isInStock = response.data.isInStock;
          this.form.assetManagerId = response.data.assetManagerId;
          console.log("this.form.assetManagerId", this.form.assetManagerId);
          // console.log("this.form.isInStock", this.form.isInStock);

          // 有时候 Vue 可能不会检测到它的变化，可以试着用 this.$set 手动更新它
          this.$set(this.form, "isInStock", response.data.isInStock);
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
          console.log(this.fileList);
          this.form.imageUrl = [];
          console.log("jieguo", response);
          this.imageUrl.push(response.msg); // 如果是多个图片，推入数组
          console.log("jieguo2", response.msg);
          this.form.imageUrl = this.imageUrl.join(","); // 最后将其合并成字符串
          console.log("tu", this.imageUrl);
          console.log("fenge", this.form.imageUrl);
          this.$message.success("上传成功");
        })
        .catch((error) => {
          console.log("error", error);
          this.$message.error("上传失败", error);
        });
    },
    //提交申请单
    submitRepairRequest() {
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
    //审核提交单
    submitExamine() {
      this.$refs["repairForm"].validate(() => {
        console.log("checkId", this.repairId);
        handelRepairAction(this.repairForm).then((response) => {
          this.$message.success("提交成功");
          console.log("上传成功", response.data);
          this.showRepairmanDialog = false;
          this.reset();
        });
      });
    },
    //维修人员 维修操作提交单 换新/维修
    submitComplete() {
      this.$refs["repairForm"].validate(() => {
        handelRepairAction(this.repairForm).then((response) => {
          this.$message.success("提交成功");
          console.log("上传成功", response.data);
          this.repairCompleteDialog = false;
          this.reset();
        });
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

.el-radio input[aria-hidden="true"] {
  display: none !important;
}

.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled) .el-radio__inner {
  box-shadow: none !important;
}
</style>
