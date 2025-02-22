<template>
  <div class="app-container">
    <!-- 实时打卡 -->
    <el-row>
      <el-button class="text" type="primary" circle @click="handleClockIn"
        >上班打卡
        <p>{{ currentTime }}</p>
      </el-button>
    </el-row>

    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <!-- 2. 查询板块 -->
        <el-form
          :model="queryParams"
          ref="queryForm"
          size="small"
          :inline="true"
          v-show="showSearch"
          label-width="68px"
        >
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              style="width: 240px"
              prefix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="员工工号" prop="workId">
            <el-input
              v-model="queryParams.workId"
              placeholder="请输入工号"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="考勤时间">
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

        <!-- 3.修改点击按钮 -->

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['system:user:edit']"
              >修改</el-button
            >
          </el-col>

          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              v-hasPermi="['system:user:import']"
              >导入</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:attendance:export']"
              >导出</el-button
            >
          </el-col>
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getAttendanceList"
            :columns="columns"
          ></right-toolbar>
        </el-row>

        <!-- table表格信息 -->
        <!-- 多选框 -->
        <el-table
          v-loading="loading"
          :data="attendanceList"
          @selection-change="handleSelectionChange"
          @cell-dblclick="handleCellDblClick"
        >
          <el-table-column type="selection" width="50" align="center" />

          <!-- 表格列内容过长时的显示问题。  :show-overflow-tooltip 自动触发省略效果（显示为 "..."） -->
          <el-table-column
            label="用户名称"
            align="center"
            key="userName"
            prop="userName"
            v-if="columns[1].visible"
            :show-overflow-tooltip="true"
          />
          <!-- 部门 -->
          <el-table-column
            label="部门"
            align="center"
            key="deptName"
            prop="deptName"
            v-if="columns[2].visible"
            :show-overflow-tooltip="true"
          />

          <!-- 工号 -->
          <el-table-column
            label="工号"
            align="center"
            key="workId"
            prop="workId"
            v-if="columns[7].visible"
            :show-overflow-tooltip="true"
          />

          <!-- 考勤日期 -->
          <el-table-column
            label="考勤日期"
            align="center"
            prop="attendanceDate"
            v-if="columns[3].visible"
            width="160"
          >
            <!-- 插槽 作用域 子组件 -->
            <template slot-scope="scope">
              <!-- <p>{{ parseTime(scope.row.createTime, '{h}:{m}:{s}') }}</p>
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span> -->
              <span>{{
                parseTime(scope.row.attendanceDate, "{y}-{m}-{d}")
              }}</span>
            </template>
          </el-table-column>

          <!-- 上班打卡 -->
          <el-table-column
            label="上班打卡"
            align="center"
            prop="amTime"
            v-if="columns[4].visible"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.amTime) }}</span>
              <!-- 如果不是正在编辑的单元格，展示打卡时间 -->
            </template>
          </el-table-column>

          <!-- 下班打卡 -->
          <el-table-column
            label="下班打卡"
            align="center"
            prop="pmTime"
            v-if="columns[5].visible"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.pmTime) }}</span>
            </template>
          </el-table-column>

          <!-- 备注 -->
          <el-table-column
            label="备注"
            align="center"
            key="remark"
            prop="remark"
            v-if="columns[6].visible"
            width="120"
          />

          <!-- 操作 -->
          <el-table-column
            label="操作"
            align="center"
            width="160"
            class-name="small-padding fixed-width"
          >
            <!-- //权限判断 v-hasPermi="['system:user:edit']"  -->
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                v-if="currentUserId === 1"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:user:edit']"
                >修改</el-button
              >

              <!-- 底 -->
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getAttendanceList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名称" prop="userName">
              <el-input
                v-model="form.userName"
                placeholder="请输入用户名称"
                maxlength="30"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="workId">
              <el-input
                v-model="form.workId"
                placeholder="工号"
                maxlength="30"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- xxx考勤时间 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="上班打卡" prop="amTime">
              <el-date-picker
                value-format="yyyy-MM-dd HH:mm:ss"
                v-model="form.amTime"
                type="datetimerange"
                placeholder="选择日期"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>

          <!-- value-format="yyyy-MM-dd hh:mm:ss"  element-ui的日期时间选择器与localdatetime类型的转换 -->
          <!-- yyyy-MM-dd hh:mm:ss格式时12小时制，要使用24小时制应该使用yyyy-MM-dd HH:mm:ss格式。 -->
          <el-col :span="12">
            <el-form-item label="下班打卡" prop="pmTime">
              <el-date-picker
                v-model="form.pmTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="选择日期"
                :default-time="['00:00:00', '23:59:59']"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 备注 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 考勤导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" />
            是否更新已经存在的考勤数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate"
            >下载模板</el-link
          >
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  resetUserPwd,
  changeUserStatus,
  deptTreeSelect,
} from "@/api/system/user";
import { getInfo } from "@/api/login";
import { getToken } from "@/utils/auth";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  addCheck,
  attendanceAllList,
  updateAttendance,
  getAttendance,
} from "@/api/system/attendance";
//格式化日期
import dayjs from "dayjs";
// import XLSX from "xlsx";

export default {
  name: "attendance",
  dicts: ["sys_normal_disable", "sys_user_sex"],
  components: { Treeselect },
  data() {
    return {
      currentUserId: undefined,
      // 实时打卡
      currentTime: "", // 实时时间显示
      timer: null, // 定时器引用,
      attendanceList: [], // 考勤记录表格数据
      editableData: null, // 存储当前正在编辑的单元格，格式为 rowId-fieldName

      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/attendance/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        // params: {},
        userName: "",
        // phonenumber: undefined,
        // status: undefined,
        deptId: undefined,
        // xxx
        remark: undefined,
        attendanceDate: "",
        amTime: undefined,
        pmTime: undefined,
        attId: undefined,
        deptName: undefined,
        workId: undefined,
      },
      dateRange: [],
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `部门`, visible: true },
        { key: 3, label: `考勤日期`, visible: true },
        { key: 4, label: `上班打卡`, visible: true },
        { key: 5, label: `下班打卡`, visible: true },
        { key: 6, label: `备注`, visible: true },
        { key: 7, label: `工号`, visible: true },
      ],
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "用户名称长度必须介于 2 和 20 之间",
            trigger: "blur",
          },
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }, //表示在输入框失去焦点时进行验证
        ],

        // xxx工号
        workId: [{ required: true, message: "工号不能为空", trigger: "blur" }],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
          {
            min: 5,
            max: 20,
            message: "用户密码长度必须介于 5 和 20 之间",
            trigger: "blur",
          },
          {
            pattern: /^[^<>"'|\\]+$/,
            message: "不能包含非法字符：< > \" ' \\ |",
            trigger: "blur",
          },
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },

      formLabelWidth: "80px",
      timer: null,
    };
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  mounted() {
    // 初始化当前时间并设置定时器
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000); // 每秒更新一次时间
  },

  created() {
    console.log("roles",this.$store.state.roles)
    // this.currentUserId = this.$store.state.roles.filter((roles)=>roles.roleId===1)
    // this.currentUserId = this.$store.state.user.id;
    // this.getList();
    this.getAttendanceList();
    this.getDeptTree();
    this.getConfigKey("sys.user.initPassword").then((response) => {
      this.initPassword = response.msg;
    });
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer);
  },

  methods: {
    // 示例：将 ISO 8601 格式转为 YYYY-MM-DD HH:mm:ss
    formatTime(isoDate) {
      return dayjs(isoDate).format("YYYY-MM-DD HH:mm:ss");
    },
    //xxx
    handleClockIn() {
      addCheck().then((response) => {
        console.log(JSON.stringify({ check_time: this.currentTime }));
      });
    },
    updateTime() {
      // 获取当前时间并格式化为 时:分:秒
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      this.currentTime = `${hours}:${minutes}:${seconds}`;
    },

    // xxx地址栏
    handleAreaChange(value) {
      console.log("选中的值:", value);
    },

    handleChange(value) {
      console.log("handleChange-value地址：" + value); // 21,2104,210402
      const a = this.getCodeToText(null, value);
      console.log(a);
      this.form.address = a;
    },
    getCodeToText(codeStr, codeArray) {
      if (null === codeStr && null === codeArray) {
        return null;
      } else if (null === codeArray) {
        codeArray = codeStr.split(",");
      }
      let area = "";
      /** */
      switch (codeArray.length) {
        case 1:
          area += codeToText[codeArray[0]];
          break;
        case 2:
          area += codeToText[codeArray[0]] + "/" + codeToText[codeArray[1]];
          break;
        case 3:
          area +=
            codeToText[codeArray[0]] +
            "/" +
            codeToText[codeArray[1]] +
            "/" +
            codeToText[codeArray[2]];
          break;
        default:
          break;
      }
      console.log("area" + area); //辽宁省/沈阳市/和平区
      // this.addForm.area = area;
      return area; //辽宁省/沈阳市/和平区
    },

    /** 查询用户列表 */
    getList() {
      this.loading = true;
      // 传入带有日期范围的查询参数
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    //xxx 页码
    handlePageChange(page) {
      this.queryParams.pageNum = page; // 更新当前页码
      this.getAttendanceList(); // 重新获取数据
    },
    /** xxx查询考勤列表 */
    // 调 接口方法 传递经过 addDateRange 查询参数
    getAttendanceList() {
      this.loading = true;
      // 打印 queryParams 调用 addDateRange 前的值
      console.log("调用 addDateRange 前的 queryParams:", this.queryParams);

      this.queryParams.beginTime = this.dateRange[0]; //可以直接.beginTime 赋值，并没有在data中初始化beginTime
      this.queryParams.endTime = this.dateRange[1];

      attendanceAllList(this.queryParams).then((response) => {
        console.log("考勤记录总", response);
        this.attendanceList = response.rows;
        console.log("response.rows", response.rows);
        this.total = response.total;
        this.loading = false;
      });
    },

    // xxx
    // 双击某个单元格，进入编辑模式
    startEdit(row, field) {
      this.editingField = `${row.id}-${field}`; // 记录正在编辑的单元格
    },

    // 保存编辑后的数据
    saveEdit(row, field) {
      // 退出编辑状态
      this.editingField = null;
      const payload = {
        id: row.id, // 记录的 ID
        [field]: row[field], // 动态设置字段名，更新相应的字段值
      };
      // 调用接口更新后端数据
      updateAttendance(payload)
        .then(() => {
          this.$message.success("保存成功");
        })
        .catch(() => {
          this.$message.console.error("保存失败，请重试");
        });
    },

    // 双击时触发
    handleCellDblClick(row, column, cell, event) {
      if (column.property === "customerBoxNum") {
        this.editableData = row; // 设置当前编辑的数据项
        this.$nextTick(() => {
          const inputRef = "input-" + this.boxList.indexOf(row);
          const inputElement = this.$refs[inputRef];
          if (inputElement) {
            inputElement.focus(); // 聚焦输入框
          } else {
            console.error("Input element not found:", inputRef);
          }
        });
      }
    },

    handleInputBlur(row) {
      // 输入框失去焦点时保存更改
      this.editableData = null; // 返回到静态显示状态
    },
    handleInputEnter(row) {
      // 按下回车键时保存更改
      this.editableData = null; // 返回到静态显示状态
    },

    /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then((response) => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      console.log(data);
      this.queryParams.deptId = data.id;
      this.handleQuery();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal
        .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
        .then(function () {
          return changeUserStatus(row.userId, row.status);
        })
        .then(() => {
          this.$modal.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
        // xxx
        workId: undefined,
        address: undefined,
        selectedOptions: [],
        remark: undefined,
        attId: undefined,
        amTime: undefined,
        pmTime: undefined,
        deptName: undefined,
      };
      // this.selectedOptions =[]
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getAttendanceList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.deptId = undefined;
      this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      console.log(selection);
      this.ids = selection.map((item) => item.attId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleAuthRole":
          this.handleAuthRole(row);
          break;
        default:
          break;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.show = true;
      this.reset();
      getUser().then((response) => {
        console.log(response);
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.open = true;
        this.title = "添加用户";
        this.form.password = this.initPassword;
      });
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log(row);
      this.show = false;
      this.reset();
      const attId = row.attId || this.ids; //ids 选中数组
      getAttendance(attId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改考勤记录";
      });
    },

    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
        inputValidator: (value) => {
          if (/<|>|"|'|\||\\/.test(value)) {
            return "不能包含非法字符：< > \" ' \\ |";
          }
        },
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.$modal.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.userId;
      this.$router.push("/system/user-auth/role/" + userId);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.attId != undefined) {
            updateAttendance(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getAttendanceList();
            });
          }
        }
      });
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "system/attendance/export",
        {
          ...this.queryParams,
        },
        `attendance_${new Date().getTime()}.xlsx`
      );
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "考勤导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download(
        "system/attendance/importTemplate",
        {},
        `attendance__template_${new Date().getTime()}.xlsx`
      );
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      console.log(event);
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      console.log(response);
      //xx
      const reader = new FileReader();
      const data = new Uint8Array(event.target.result);

      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          "</div>",
        "导入结果",
        // 将 dangerouslyUseHtmlString 属性设置为 true ，message 就会被当做 HTML 片段处理。
        { dangerouslyUseHTMLString: true }
      );
      this.getAttendanceList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
  },
};
</script>
<style lang="scss" scoped>
.el-date-picker {
  width: 200px;
  border-block-color: red;
}

.text {
  text-align: center;
  margin-bottom: 10px;
}

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>
