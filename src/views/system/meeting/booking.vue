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
      <!-- //prop="roomId"  修改过 prop表单域 model 字段，在使用 validate、resetFields
        方法的情况下，该属性是必填的 2得和 :value绑定的值一样 -->

      <!-- 与用户名称搜索方法相同 -->
      <el-form-item label="会议室" prop="roomName">
        <el-input
          v-model="queryParams.roomName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="预约时间">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="{
            start: '08:30',
            step: '00:15',
            end: '18:30',
          }"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="审核状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审核状态"
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
          @click="reservation"
          >预约会议</el-button
        >
      </el-col>

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
      :data="bookingList"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="会议室"
        align="center"
        prop="meetingRoom.roomName"
        width="80"
        show-overflow-tooltip
      />
      <el-table-column
        label="主题"
        align="center"
        prop="theme"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="开始时间"
        align="center"
        prop="startTime"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="endTime"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="申请人"
        align="center"
        prop="sysUser.userName"
        width="80"
        show-overflow-tooltip
      />
      <el-table-column
        label="联系方式"
        align="center"
        prop="sysUser.phonenumber"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column prop="status" label="状态" width="80">
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.status === 0
                ? ''
                : scope.row.status === 1
                ? 'success'
                : 'danger'
            "
            size="mini"
          >
            <span>{{ getStatusLabel(scope.row.status) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createdAt"
        width="180"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="
              scope.row.sysUser.userId === loginUser.userId &&
              scope.row.status === 0
            "
            >删除</el-button
          >申请状态：{{ scope.row.status }}----用户id{{ loginUser.userId }}
        </template>
      </el-table-column>
      <!-- 审核按钮 -->
      <el-table-column
        label="审核"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope" v-if="loginUser.roles[0].roleId === 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleExamine(scope.row)"
            v-if="scope.row.status == 0"
            >审核</el-button
          >
          {{ loginUser.roles[0].roleId }}
          {{ scope.row.bookingId }}
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

    <!-- 预约会议室对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="700px"
      append-to-body
      :before-close="handleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="会议主题" prop="theme">
              <el-input v-model="form.theme" placeholder="请输入申请原因" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="预约时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="起始日期"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm:ss"
                :picker-options="pickerOptionsStart"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="结束时间"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm:ss"
                :picker-options="pickerOptionsEnd"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 可用会议室展示 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="会议室" prop="roomId">
              <el-select
                :disabled="!form.startTime || !form.endTime"
                v-model="form.roomId"
                :placeholder="
                  !form.startTime || !form.endTime
                    ? '请先选择预约时间'
                    : '请选择会议室'
                "
                style="width: 100%"
                @focus="fetchAvailableRooms"
              >
                <!-- @focus="fetchAvailableRooms 在输入框获得焦点时，调用 fetchAvailableRooms 方法 -->

                <el-option
                  v-for="room in availableRooms"
                  :key="room.roomId"
                  :label="`${room.roomName} - 容纳人数: ${
                    room.capacity || '未知'
                  }`"
                  :value="room.roomId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 实现通过现在登录的账号直接获取信息 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="预约人" prop="userId">
              <el-input
                v-model="form.userName"
                placeholder="请输入姓名"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="phonenumber">
              <el-input
                v-model="form.phonenumber"
                placeholder="请输入联系方式"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 参会人tree选择 -->
        <el-row>
          <el-form-item label="参会人员">
            <el-button @click="openDrawer" type="text" icon="el-icon-user">
              选择部门和员工
            </el-button>

            <span
              v-if="form.checkedAttendees && form.checkedAttendees.length > 0"
            >
              <el-tag
                style="margin-left: 10px"
                v-for="checkedNode in form.checkedAttendees.slice(0, 4)"
                :type="checkedNode.type === 2 ? 'success' : 'warning'"
                :key="checkedNode.key"
              >
                {{ checkedNode.label }}
              </el-tag>
              <!-- 当选中人数超过3个时，显示省略号 -->
              <span
                v-if="form.checkedAttendees.length > 4"
                style="margin-left: 10px"
                >... 等
                <span style="font-weight: bold; color: green">
                  {{ form.checkedAttendees.length }} </span
                >部门/人</span
              >
            </span>

            <!-- 子组件 -->
            <!-- drawerVisible = $event 是将事件传递的数据 ($event)，
即子组件传递的 false（或者 true）赋值给父组件中的 drawerVisible。 -->
            <attendee-selector
              :drawer-visible="drawerVisible"
              :default-checked-ids="defaultCheckedIds"
              :dept-props="deptProps"
              @update:drawerVisible="drawerVisible = $event"
              @update:checkedAttendees="form.checkedAttendees = $event"
              @confirm="handleConfirmSelection"
            />
            <!--  -->
          </el-form-item>
        </el-row>

        <!-- 预约时间 -->

        <el-form-item label="会议用途" prop="purpose">
          <el-input
            v-model="form.purpose"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 审核弹框 -->
    <el-dialog
      :title="title"
      :visible.sync="examine"
      width="600px"
      append-to-body
    >
      <el-radio-group v-model="status">
        <el-radio label="1">通过</el-radio>
        <el-radio label="2">拒绝</el-radio>
      </el-radio-group>
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
        v-model="examineReason"
        :disabled="status !== '2'"
      >
      </el-input>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitExamine">确 定</el-button>
        <el-button @click="cancelExamine">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getUsers,
  addBooking,
  listBooking,
  delBooking,
  getAvailableRooms,
  requestStatus,
} from "@/api/system/meetingbooking";
import { listDept, getDeptTree } from "@/api/system/dept";
import { listMeetingRoom, getRoomNamelist } from "@/api/system/meetingroom";
import { getInfo } from "@/api/login";
import { getUserProfile, listUser } from "@/api/system/user";
import AttendeeSelector from "./AttendeeSelector.vue";

export default {
  name: "MeetingBooking",
  dicts: ["sys_normal_disable"],
  components: {
    AttendeeSelector,
  },
  data() {
    return {
      drawerVisible: false, // 控制 Drawer 是否显示
      // 默认展开的一级节点
      defaultCheckedIds: [], // 默认选中的 id 数组
      rowExamine: {},
      checkedNodes: [{ key: "12", label: "12" }], //参会人 tree-存储选中的部门或者员工
      // 树的数据
      deptTreeData: [],

      // 树形结构的属性配置
      deptProps: {
        // 配置 Tree 组件的显示属性
        label: "label", // 节点显示的字段名
        isLeaf: "isLeaf", // 是否为叶子节点（懒加载时需要）
      },

      status: 1,
      examineReason: "", // 拒绝理由
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染参会人选择-部门表格状态
      refreshTable: true,
      userIds: [], //存储选中的用户
      deptIds: [], //存储选中的部门
      // 用户表格数据
      userList: [],
      deptList: [],
      loginUser: "",
      loginUserRoleId: "",
      query: "", // 输入的查询内容

      filteredRooms: [], // 过滤后的会议室列表
      gridData: 1111,
      // 参会人弹框Test

      searchQuery: "",
      dialogVisibleUser: false,
      dialogVisible: false,
      selectedDepartment: "",
      currentPage: 1,
      pageSizeTest: 5,
      totalPeople: 0,
      departments: [
        { id: 1, label: "技术部" },
        { id: 2, label: "市场部" },
        { id: 3, label: "销售部" },
      ],
      treeProps: {
        children: "children", // 如果有子节点用这个字段
        label: "label", // 用于显示节点的字段
      },
      availableRooms: [], // 可用会议室列表
      searchText: "", // 输入框内容

      // roomNamelist: [],
      filteredRooms: [], // 存储过滤后的会议室
      timeout: null,
      randId: new Date().getTime(),
      statusOptions: [
        { value: 0, label: "已发起" },
        { value: 1, label: "已同意" },
        { value: 2, label: "已驳回" },
      ],
      status: [],
      dateRange: [],
      rooms: [], // 存储会议室列表
      users: [], // 用户列表 后端提供 返回用户的 ID 和名称。
      // depts: [], // 部门列表 返回部门的 ID 和名称。
      //日期
      //开始结束时间
      test: "",
      timePicker: [new Date(2016, 9, 10, 8, 40), new Date(2016, 9, 10, 9, 40)],
      timeRange: [], //预约时间

      // 遮罩层
      loading: true,
      // 选中数组id
      ids: [],

      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 会议记录数据
      bookingList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示审核弹出层
      examine: false,
      // 查询参数
      queryParams: {
        status: 1,
        theme: undefined,
        roomName: undefined,
        dateRange: undefined,
        pageNum: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
      },
      //dialog员工查询参数
      queryParamsUser: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        deptName: undefined,
      },

      // 列信息
      columns: [
        { key: 0, label: `用户名称`, visible: true },
        { key: 1, label: `员工工号`, visible: true },
        { key: 2, label: `部门`, visible: true },
        { key: 3, label: `手机号码`, visible: true },
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        roomId: [
          { required: true, message: "会议室不能为空", trigger: "blur" },
        ],
        theme: [
          { required: true, message: "会议主题不能为空", trigger: "blur" },
        ],
        userName: [
          { required: true, message: "预约人不能为空", trigger: "blur" },
        ],
        phonenumber: [
          { required: true, message: "联系方式不能为空", trigger: "blur" },
        ],
        startTime: [
          { required: true, message: "会议时间不能为空", trigger: "blur" },
        ],
        endTime: [
          { required: true, message: "会议时间不能为空", trigger: "blur" },
        ],
        participants: [
          {
            required: true,
            message: "请选择至少一个参会人或部门",
            trigger: "change",
          },
        ],
      },
    };
  },
  watch: {},
  // computed计算速度大于 props数据传递速度
  computed: {
    // 参会人Test
    filteredPeople() {
      let filtered = this.people;
      // 部门过滤
      if (this.selectedDepartment) {
        filtered = filtered.filter(
          (person) => person.department === this.selectedDepartment
        );
      }
      // 姓名模糊搜索
      if (this.searchQuery) {
        filtered = filtered.filter((person) =>
          person.name.includes(this.searchQuery)
        );
      }
      // 分页
      return filtered.slice(
        (this.currentPage - 1) * this.pageSizeTest,
        this.currentPage * this.pageSizeTest
      );
    },

    pickerOptionsStart() {
      let selectableRange = "00:00:00 - 23:59:00";
      const date = new Date();
      const curr = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      console.log(curr);
      if (this.form.startTime && this.form.startTime.substr(0, 10) === curr) {
        selectableRange = `${date.getHours()}:${
          date.getMinutes() + 1
        }:00 - 23:59:00`;
      }
      return {
        step: "00:30:00",
        selectableRange,
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      };
    },
    pickerOptionsEnd() {
      let selectableRange = "00:00:00 - 23:59:00";
      const date = new Date();
      const curr = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
      console.log(curr);
      if (this.form.endTime && this.form.endTime.substr(0, 10) === curr) {
        selectableRange = `${date.getHours()}:${
          date.getMinutes() + 1
        }:00 - 23:59:00`;
      }
      return {
        selectableRange,
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      };
    },
  },
  created() {
    this.getUser();
    this.getList();
  },
  mounted() {
    // const drawer = this.$refs.drawer;
    // if (drawer) {
    //   const elements = drawer.$el.querySelectorAll(".some-class");
    //   console.log(elements);
    // }
    // 获取用户和部门列表
    this.fetchData();
    this.fetchRooms(); // 组件挂载时获取会议室数据
  },
  methods: {
    // 打开抽屉
    openDrawer() {
      this.drawerVisible = true;
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
    treeCheck(currNode, { checkedKeys, checkedNodes }) {
      console.log(currNode);
      console.log({ checkedKeys, checkedNodes });
      this.checkedNodes = checkedNodes;
      // this.$set(this.checkedNodes, 0, currNode)
    },

    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      // 在 Vue 中，当你修改数据时，DOM 的更新是异步的，
      // Vue 会等到所有数据修改完成后，再批量更新 DOM。
      // 如果你在数据修改后立即尝试操作 DOM，可能会发现 DOM 还没更新完成，这时就需要用 Vue.nextTick()。
      // 简单理解：修改数据后，想要立即操作最新的 DOM → 用 Vue.nextTick()。
      // 使用场景：
      // 1.当你修改了数据，DOM 还没更新时，你需要操作更新后的 DOM。
      // 2.你希望在下一次 DOM 渲染完成后执行特定逻辑，比如滚动、聚焦等。
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },

    // 弹窗关闭前提示
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
          this.reset();
        })
        .catch((_) => {});
    },

    handleSelect(value) {
      // 选择会议室时的回调
      console.log("选择了会议室:", value);
    },

    querySearch(queryString, cb) {
      var rooms = this.rooms;
      var results = queryString
        ? rooms.filter(this.createFilter(queryString))
        : rooms;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },

    createFilter(queryString) {
      return (room) => {
        return (
          room.roomName.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    // 根据选择的时间段获取可用会议室
    fetchAvailableRooms() {
      // const [startTime, endTime] = this.form.timeRange;
      //后端拿到的时间和前端搜索的时间相比较
      // 转换为Date对象比较
      //日期格式空格要注意
      // const date = new Date(this.form.timeRange[0]);
      // const datee = new Date(this.form.timeRange[1]);
      // const isoDate = date.toISOString().slice(0, 19);
      // const isoDate = date.toISOString().slice(0, 19).replace("T", " ");
      // console.log('isoDate'+isoDate);
      // const isoDatee = datee.toISOString().slice(0, 19).replace("T", " ");
      // this.queryParams.startTime = isoDate;
      // this.queryParams.endTime = isoDatee;
      //GET /room/available?startTime=2024-12-08%2004:00:00&endTime=2024-12-08%2006:00:00
      //如果格式有误，例如 "2024-12-08T04:00:00" 或 "2024-12-08 04:00"，则会导致解析失败。
      getAvailableRooms({
        startTime: this.form.startTime,
        endTime: this.form.endTime,
      }).then((response) => {
        console.log(response);
        //↓讲一下.. filter
        this.availableRooms = response.data
          .map((item) => item.meetingRoom) //仅留meetingRoom
          //在 .filter() 方法中，room 是数组的每一个元素。
          // .filter() 会自动迭代数组中的每一个元素，将当前元素作为参数传递给回调函数
          // 过滤后的新数组
          // ex：const rooms = [null, { roomId: 1, roomName: "会议室A" }, null];
          // rooms.filter((room) => room !== null);
          // room 是回调函数中的参数，代表数组中的每个元素。
          // 如果不进行过滤，前端处理时可能会出错（比如尝试读取 null.roomId 会报错）。
          // filter() 方法会自动迭代数组，并将当前元素传递给回调函数的第一个参数。
          .filter((room) => room !== null);
        if (!this.availableRooms.length) {
          console.error("没有符合条件的会议室");
        }
      });
    },

    //绑定的函数，用于动态获取候选项。参数包括用户输入 (queryString) 和回调函数 (callback)。
    fetchSuggestions(queryString, callback, bookingList) {
      if (!queryString) {
        callback([]); // 如果输入为空，返回空数组
        return;
      }

      const results = this.bookingList.roomName.filter(
        (item) => item.includes(queryString) // 模糊匹配逻辑
      );
      callback(results); // 返回匹配结果
      // 模拟延迟（类似后端请求）
      setTimeout(() => {
        callback(results); // 返回匹配的结果
      }, 300); // 延迟300ms
    },
    // 处理选择事件 选择会议室
    handleSelect(item) {
      console.log("选中:", item);
      this.queryParams.roomName = item; //设置输入框值为选中项
    },
    //审核状态
    getStatusLabel(status) {
      // 根据状态值获取对应的文本标签
      const option = this.statusOptions.find((item) => item.value === status);

      return option ? option.label : "未知状态";
    },
    //审核
    handleExamine(row) {
      console.log("row:", row);
      this.rowExamine = row;
      this.examine = true;
    },
    //会议室列表
    fetchRooms() {
      listMeetingRoom().then((response) => {
        console.log(response);
        this.rooms = response.rows;
      });
    },
    fetchRoomName() {
      getRoomNamelist().then((response) => {
        console.log(response);
      });
    },
    selectBlur(e) {
      // 意见类型
      if (e.target.value !== "") {
        this.value = e.target.value + "(其他)";
        // this.$forceUpdate(); // 强制更新
      }
    },
    selectClear() {
      this.value = "";
      // this.$forceUpdate();
    },
    selectChange(val) {
      this.value = val;
      // this.$forceUpdate();
    },
    /** fetch 是一个现代浏览器提供的 API，用于在 JavaScript 中发起 HTTP 请求，
     * 获取资源（如数据）或与后端服务器进行交互。它是 XMLHttpRequest 的替代品，
     * 语法更加简洁，功能也更强大。fetch 是基于 Promise 的，这意味着它能够更好地处理异步操作。 */
    //用户列表 + 部门列表
    fetchData() {
      getUsers({}).then((response) => {
        console.log(response);
        this.users = response.rows;
        console.log(this.users);
      });
      listDept({}).then((response) => {
        this.depts = response.rows;
        console.log(this.depts);
      });
    },
    customFilter(query) {
      // 自定义过滤方法
      return this.users.filter((user) =>
        user.userName.toLowerCase().includes(query.toLowerCase())
      );
    },
    /** 查询预约记录列表 */
    getList() {
      this.loading = true;
      console.log("调用前的 queryParams:", this.queryParams);

      this.queryParams.startTime = this.dateRange[0]; //可以直接.beginTime 赋值，并没有在data中初始化beginTime
      this.queryParams.endTime = this.dateRange[1];
      listBooking(this.queryParams).then((response) => {
        console.log(response);
        this.bookingList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** dialog查询用户列表 */
    getUserList() {
      this.loading = true;
      console.log(
        "user---调用 addDateRange 前的 queryParamsUser:",
        this.queryParamsUser
      );
      const updatedParams = this.addDateRange(this.queryParamsUser);
      // 打印调用 addDateRange 后的值
      console.log(
        "user---调用 addDateRange 后的 queryParamsUser:",
        updatedParams
      );
      listUser(updatedParams).then((response) => {
        this.userList = response.rows;
        console.log(this.userList);
        this.total = response.total;
        this.loading = false;
      });
    },

    //获取当前登录用户
    getUser() {
      getUserProfile().then((response) => {
        this.loginUser = response.data;
        // 获取所有角色的 roleId
        if (this.loginUser.roles && this.loginUser.roles.length > 0) {
          const roleIds = this.loginUser.roles.map((role) => role.roleId); // 获取所有角色的 roleId
          console.log("roleIds:", roleIds);
        }
        // 获取 roles 中第一个角色的 roleId
        if (this.loginUser.roles && this.loginUser.roles.length > 0) {
          const roleId = this.loginUser.roles[0].roleId; // 获取第一个角色的 roleId
          console.log("loginUserRoleId:", roleId);
        }

        console.log("loginUser:", this.loginUser);
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 审核弹框取消按钮
    cancelExamine() {
      this.examine = false;
      this.resetExamine();
    },

    /** dialog按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
      console.log(row);
      this.dialogTableVisible = true;
    },

    /** 参会人员dialog操作 */
    // dialog嵌套问题 遮罩层遮住 注意
    openDialog() {
      this.getUserList();
      // 选中的那些ids行数据和整个行数据比较 一样 那就勾勾 就是123→ 123456 1→123456 2→123456
      this.userIds.forEach((key) => {
        this.userList.forEach((row) => {
          if (row.userId == key.userId) {
            this.$refs.userMultipleTable.toggleRowSelection(row, true);
          }
        });
      });

      this.dialogVisibleUser = true;
    },

    handleDepartmentClick(node) {
      this.selectedDepartment = node.label;
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    addPerson(person) {
      if (!this.selectedPeople.includes(person)) {
        this.selectedPeople.push(person);
      }
    },

    handleConfirmSelection(selectedAttendees) {
      this.form.checkedAttendees = selectedAttendees;
      console.log("已选中人员:", this.form.checkedAttendees);
    },
    //dialog参会人提交按钮
    confirmSelection() {
      console.log("已选择的参会人:", this.userIds);
      console.log("已选择的参会人:", this.deptIds);
      // if (this.userIds.length === 0) {
      //   this.$message.warning("请至少选择一个参会人！");
      //   return;
      // }
      // 提交选中的用户数据到dialog外层userId
      // 将选中的参会人添加到外框表单中
      // this.form.attendees = this.userIds.map((user) => ({
      //   userId: user.userId,
      //   userName: user.userName,
      // }));

      this.dialogVisibleUser = false;
      this.dialogVisible = false;
    },
    removeAttendeeUser(users) {
      // 移除选中的参会人
      // e当前那一行  e.userId !== users.userId 返回布尔Boolean 如果为true 保留这一行给userIds
      this.userIds = this.userIds.filter((e) => e.userId !== users.userId);
      //$refs ref绑定的那个元素 table  userMultipleTable这是命名
      //toggleRowSelection(users, true); 把users当前这一行的值 打勾勾 其余的就不打勾了
      this.$refs.userMultipleTable.toggleRowSelection(users, true);
    },

    // 表单重置
    reset() {
      this.form = {
        purpose: undefined, //会议用途目的备注
        theme: undefined, //会议主题
        roomName: undefined, //会议主题
        bookedBy: undefined, //会议主题
        // dateRange: undefined, xx它属于form为什么在这边失效呢？
        roomId: null,
        userId: undefined,
        userName: undefined,
        phonenumber: undefined,
        startTime: undefined,
        endTime: undefined,
        userIds: [],
        userId: undefined,
      };
      this.resetForm("form");
    },

    // 表单重置
    resetExamine() {
      this.status = "1"; // 默认通过
      this.examineReason = ""; // 清空理由
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** dialog搜索按钮操作 */
    handleQueryUser() {
      this.queryParamsUser.pageNum = 1;
      this.getUserList();
    },
    /** dialog部门搜索按钮操作 */
    handleQueryDept() {
      this.queryParamsDept.pageNum = 1;
      this.getDeptList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** dialog员工重置按钮操作 */
    resetQueryUser() {
      this.resetForm("queryFormUser");
      this.handleQueryUser();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      console.log("selection", selection);
      this.ids = selection.map((item) => item.bookingId);
      this.rooms = selection.map((item) => item.meetingRoom.roomName);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 多选框员工选中数据dialog
    handleSelectionChangeUser(selection) {
      // this.ids = selection.map((item) => item.userId);
      console.log(1, selection);
      this.userIds = selection;
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },

    /** 新增预约按钮操作 */
    reservation() {
      this.reset();
      getInfo().then((response) => {
        console.log("response", response);
        const currentUser = response.user;
        this.form.userName = currentUser.userName;
        this.form.phonenumber = currentUser.phonenumber;
      });

      this.open = true;
      this.title = "预约会议室";
    },
    submitExamine() {
      // 检查如果是拒绝，则需要填写理由
      if (this.status === "2" && !this.examineReason) {
        this.$message.error("请填写拒绝理由");
        return;
      }

      // 发送请求到后端
      const requestData = {
        bookingId: this.rowExamine.bookingId, // 传入会议ID
        status: this.status, // 审核结果
        examineReason: this.examineReason, // 拒绝理由
      };
      console.log("requestData:", requestData);
      requestStatus(requestData).then((response) => {
        this.$modal.msgSuccess("审核成功");
        this.examine = false;
      });
    },

    /** 提交按钮 */
    submitForm: function () {
      //部门id和员工id区分

      this.$refs["form"].validate((valid) => {
        if (valid) {
          addBooking(this.form).then((response) => {
            console.log("submitForm:" + this.form);
            if (response.code === 200) {
              this.$modal.msgSuccess("预约成功");
              this.open = false;
              this.getList();
            } else if (response.code === 400) {
              //显示错误信息  会议室冲突
              console.log("预约失败");
            }
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const bookingId = row.bookingId || this.ids;
      const roomName = row.roomName || this.rooms;
      console.log("row.roomName", row.roomName);
      console.log("会议管理delete：", row);
      this.$modal
        .confirm('是否确认删除编号为"' + roomName + '"的数据项？')
        .then(function () {
          return delBooking(bookingId);
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
        "system/post/export",
        {
          ...this.queryParams,
        },
        `post_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
<style scoped>
.el-table .cell {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 内容溢出隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
}
</style>
