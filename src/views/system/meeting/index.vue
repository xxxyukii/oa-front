<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <!-- 会议室名称 -->
      <el-form-item label="会议室名" prop="roomName">
        <el-input
          v-model="queryParams.roomName"
          placeholder="请输入会议室名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- 设备 -->
      <el-form-item label="支持设备" prop="equipment">
        <el-input
          v-model="queryParams.equipment"
          placeholder="请输入设备"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 状态 占用 空闲 -->
      <el-form-item label="状态" prop="inUse">
        <el-select v-model="queryParams.inUse" placeholder="是否占用" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:post:add']"
          >新增</el-button
        >
      </el-col>

      <!-- 按钮的启用和禁用状态基于 single 和 multiple 变量的值， -->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <!-- :disabled="multiple"multiple 的值为 true，那么该元素（例如 el-select）会被禁用（即 disabled 为 true）。 -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="roomList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会议室名" align="center" prop="roomName" />
      <!-- <el-table-column label="图片" align="center" prop="image_url" /> -->
      <el-table-column label="图片">
        <!-- <template #default="{ row }">    // Scoped Slots 获取行数据 当前行的数据   这是vue3 -->
        <template slot-scope="scope">
          <img
            :src="scope.row.imageUrl"
            alt="会议室图片"
            v-if="scope.row.imageUrl"
            style="width: 100px; height: 60px; object-fit: cover"
          />
          <span v-else>暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="容纳人数" align="center" prop="capacity" />
      <el-table-column label="位置" align="center" prop="location" />
      <el-table-column label="设备" align="center" prop="equipment" />
      <el-table-column label="状态" align="center" prop="inUse">
        <template slot-scope="scope">
          <!-- <dict-tag
            :options="dict.type.sys_normal_disable"
            :value="scope.row.inUse"
          /> -->
          <el-switch
            v-model="scope.row.inUse"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :before-close="handleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会议室名" prop="roomName">
          <el-input v-model="form.roomName" placeholder="请输入会议室名称" />
        </el-form-item>

        <el-form-item label="支持设备" prop="equipment">
          <el-input v-model="form.equipment" placeholder="请输入设备" />
        </el-form-item>

        <!-- 上传图片 -->
        <el-form-item label="图片" prop="imageUrl" v-model="form.imageUrl">
          <el-upload
            class="upload-demo"
            action=""
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :limit="1"
          >
            <el-button size="small" type="primary" @click="uploadImg()"
              >点击上传</el-button
            >
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>

        <!-- 可容纳人数 -->
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number
            v-model="form.capacity"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="位置" prop="location">
          <el-input
            v-model="form.location"
            type="textarea"
            placeholder="位置"
          />
        </el-form-item>

        <el-form-item label="是否占用" prop="inUse">
          <el-radio-group v-model="form.inUse">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import {
//   listPost,
//   getPost,
//   delPost,
//   addPost,
//   updatePost,
// } from "@/api/system/post";

import {
  listMeetingRoom,
  addMeetingRoom,
  getMeetingRoom,
  updateMeetingRoom,
  delMeetingRoom,
  changeRoomInUse
} from "@/api/system/meetingroom";

export default {
  name: "MeetingRoom",
  dicts: ["sys_normal_disable"],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      names: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      roomList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        capacity: undefined,
        roomName: "",
        inUse: undefined,
        equipment: "",
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        roomName: [
          { required: true, message: "会议室名称不能为空", trigger: "blur" },
        ],
        theme: [
          { required: true, message: "岗位编码不能为空", trigger: "blur" },
        ],
        postSort: [
          { required: true, message: "岗位顺序不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    //xx
    // 在上传之前进行格式和大小检查

    beforeUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png"; // 限制格式
      const isLt500k = file.size / 1024 / 1024 < 0.5; // 限制大小 500KB
      if (!isJPG) {
        this.$message.error("只能上传 JPG/PNG 格式的图片");
      }
      if (!isLt500k) {
        this.$message.error("上传图片大小不能超过 500KB");
      }
      return isJPG && isLt500k; // 返回布尔值，决定是否可以上传
    },

    handlePreview(file) {
      console.log(file);
    },
    handleRemove(file) {
      console.log(file);
    },
    /** 查询岗位列表 */
    getList() {
      this.loading = true;
      listMeetingRoom(this.queryParams).then((response) => {
        this.roomList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    //dialog弹框关闭提示
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
          this.reset();
        })
        .catch((_) => {});
    },
    // 表单重置
    reset() {
      this.form = {
        roomId: undefined,
        capacity: 0,
        roomName: "",
        postSort: 0,
        inUse: "0",
        remark: undefined,
        equipment: "",
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      console.log("selection", selection);
      this.ids = selection.map((item) => item.roomId);
      console.log("ids", this.ids);
      this.names = selection.map((item) => item.roomName);
      console.log("names", this.names);
      //xx ?
      // 则 this.single 被设置为 true（表示当前不是单选状态）。
      // 只要是选中了2条以上即不是1条情况下马上把修改按钮改成禁用
      this.single = selection.length != 1;
      // 当 selection 为空数组时，selection.length 为 0，逻辑非之后为 true，此时 this.multiple 被设置为 true。
      this.multiple = !selection.length;
    },

    // 状态修改
    handleStatusChange(row) {
      let text = row.inUse === "0" ? "启用" : "停用";
      this.$modal
        .confirm('确认要"' + text + '""' + row.roomName + '"会议室吗？')
        .then(function () {
          return changeRoomInUse(row.roomId, row.inUse);
        })
        .then(() => {
          this.$modal.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.inUse = row.inUse === "0" ? "1" : "0";
        });
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加会议室";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log("変更row:", row);
      this.reset();
      const roomId = row.roomId || this.ids;
      console.log("room",roomId)
      getMeetingRoom(roomId).then((response) => {
        console.log("response", response);
        this.form = response.data;
        this.open = true;
        this.title = "修改会议室";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.roomId != undefined) {
            console.log("支持设备", this.form.equipment);
            updateMeetingRoom(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMeetingRoom(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      console.log("del+row", row);
      const roomIds = row.roomId || this.ids;
      const roomName = row.roomName || this.names;
      //多选删除 怎么列出显示出要删除的 roomName名

      this.$modal
        .confirm('是否确认删除会议室名称为"' + roomName + '"的数据项？')
        .then(function () {
          return delMeetingRoom(roomIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "system/meeting/export",
        {
          ...this.queryParams,
        },
        `meetingRoom_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
