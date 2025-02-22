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
      <!-- 资产名称 -->
      <el-form-item label="资产名称" prop="assetName">
        <el-input
          v-model="queryParams.assetName"
          placeholder="请输入资产名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- 设备类型 -->
      <el-form-item label="资产类别" prop="assetType">
        <el-input
          v-model="queryParams.assetType"
          clearable
          @keyup.enter.native="handleQuery"
          placeholder="请选择资产类别"
        >
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          検索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >リセット</el-button
        >
      </el-form-item>
    </el-form>
    <el-row :gutter="10" style="margin: 0 0 10px 0">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:asset:add']"
          >新規</el-button
        >
      </el-col>
      <!-- 只要是选中了2条以上即不是1条情况下马上把修改按钮改成禁用  -->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >変更</el-button
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
          v-hasPermi="['system:asset:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImport"
          v-hasPermi="['system:asset:import']"
          >入力</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:asset:export']"
          >出力</el-button
        >
      </el-col>
    </el-row>
    <el-row>
      <el-table
        v-loading="loading"
        :data="assetsData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          prop="assetType"
          label="资产类别"
          align="center"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">{{
            assetTypeDict(scope.row.assetType)
          }}</template>
        </el-table-column>
        <el-table-column
          prop="assetName"
          label="资产名称"
          align="center"
          width="100"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="snNumber"
          label="资产SN号"
          align="center"
          width="100"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="brand"
          label="品牌"
          align="center"
          width="100"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="sysDept.deptName"
          label="使用部门"
          align="center"
          width="100"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="userName"
          label="使用员工"
          align="center"
          width="100"
          show-overflow-tooltip
        >
        </el-table-column>
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
          prop="quantity"
          label="数量"
          align="center"
          width="50"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="unit"
          label="单位"
          align="center"
          width="50"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="isInStock"
          label="是否在库"
          align="center"
          width="80"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.isInStock === 'Y' ? '' : 'danger'"
              size="mini"
            >
              <span>{{ getStockLabel(scope.row.isInStock) }}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="isNew"
          label="是否全新"
          align="center"
          width="80"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.isNew === 'Y' ? '' : 'danger'" size="mini">
              <span>{{ getNewLabel(scope.row.isNew) }} </span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="location"
          label="资产所在位置"
          align="center"
          width="120"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column label="操作" align="center" width="160">
          <!-- admin超级管理员是不能修改的  -->
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >
              変更
            </el-button>

            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getAssetsList"
      />
    </el-row>
    //変更html コンポーネント
    <!-- <asset-update :open.sync="open" @update:open="open = $event">
    </asset-update> -->
    //変更html
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      append-to-body
      :before-close="handleClose"
    >
    <!-- label-width="80px"指定表单元素标签（label）的宽度。它通常用于与输入框、选择框等表单元素一起使用，以确定标签的宽度 -->
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="资产名称" prop="assetName">
              <el-input
                v-model="form.assetName"
                placeholder="请输入"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="true ? 8 : 12"> -->
          <el-col :span="6">
            <el-form-item label="数量" prop="quantity">
              <el-input v-model="form.quantity" @blur="handleBlur" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单位" prop="unit">
              <el-select
                :disabled="!form.quantity"
                :placeholder="!form.quantity ? '请先选择数量' : ''"
                v-model="form.unit"
              >
                <el-option
                  v-for="dict in dict.type.asset_unit"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 资产类型 字典 dicts -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="资产类型" prop="assetType" >
              <el-select v-model="form.assetType" placeholder="请选择资产类型">
                <el-option
                  v-for="dict in dict.type.asset_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 资产管理人 -->
          <el-col :span="12">
            <el-form-item label="资产管理" prop="assetManagerName">
              <el-autocomplete
                class="inline-input"
                v-model="form.assetManagerName"
                :fetch-suggestions="querySearch"
                placeholder="模糊查询"
                :trigger-on-focus="false"
                @select="handleSelect"
               
              >
                <!-- 自定义显示内容  插槽 <template #default="{ item }"> vue3  { item } 是一种 解构赋值-->
                <template v-slot:default="scope">
                  <span>{{ scope.item.value }}</span>
                  <span style="color: #999; font-size: 12px"
                    >{{ scope.item.workId }})</span
                  >
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="品牌名称" prop="brand">
              <el-input
                v-model="form.brand"
                placeholder="请输入品牌名称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品型号" prop="model">
              <el-input
                v-model="form.model"
                placeholder="请输入"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品SN号" prop="snNumber" v-if="reveal">
              <el-input
                v-model="form.snNumber"
                placeholder="请输入"
                maxlength="30"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买批号" prop="purchaseBatch">
              <el-input
                v-model="form.purchaseBatch"
                placeholder="请输入"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="出厂日期" prop="manufacturingDate">
              <el-date-picker
                v-model="form.manufacturingDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库日期" prop="inboundDate">
              <el-date-picker
                v-model="form.inboundDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          
          <!-- 所属部门 -->
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect
                v-model="form.deptId"
                :options="deptOptions"
                :show-count="true"
                placeholder="请选择归属部门"
              />
            </el-form-item>
          </el-col>
          <!-- 所属员工 -->
          <el-col :span="12">
            <el-form-item label="所属员工" prop="userName">
              <el-autocomplete
                class="inline-input"
                v-model="form.userName"
                :fetch-suggestions="querySearch"
                placeholder="模糊查询"
                :trigger-on-focus="false"
                @select="handleSelectUser"
                >
                
              >
                <!-- 自定义显示内容  插槽 <template #default="{ item }"> vue3 -->
                <template v-slot:default="scope">
                  <span>{{ scope.item.value }}</span>
                  <span style="color: #999; font-size: 12px"
                    >({{ scope.item.workId }})</span
                  >
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
        </el-row>
        
        
        <!-- 状态 -->
        <el-row>
          <el-form-item label="状态" prop="status" v-if="revealStatus" >
            <el-select v-model="form.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="so in statusOptions"
                :key="so.value"
                :label="so.label"
                :value="so.value"
              />
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="在库" prop="isInStock">
            <el-select v-model="form.isInStock" placeholder="请选择" clearable>
              <el-option
                v-for="so in this.stockAndNewOptions"
                :key="so.value"
                :label="so.label"
                :value="so.value"
              />
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="全新" prop="isNew">
            <el-select v-model="form.isNew" placeholder="请选择" clearable>
              <el-option
                v-for="so in this.stockAndNewOptions"
                :key="so.value"
                :label="so.label"
                :value="so.value"
              />
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="所在位置" prop="location">
            <el-input
              v-model="form.location"
              placeholder="请输入"
              maxlength="30"
            />
          </el-form-item> </el-row
        ><el-row>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              placeholder="请输入"
              type="textarea"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  assetsList,
  getAsset,
  updateAsset,
  addAsset,
  delAsset,
} from "@/api/system/asset";
import AssetUpdate from "../asset/assetUpdate.vue";
import { deptTreeSelect, getUserInfo } from "@/api/system/user";
import { getDeptTree } from "@/api/system/dept";
//xx??
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "assets",
  components: { AssetUpdate, Treeselect },
  dicts: ["asset_type", "asset_unit"],
  data() {
    return {
      userName: [],
      //查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        assetName: undefined,
        assetType: undefined,
        status: undefined,
        isInStock: undefined,
      },
      // 总条数
      total: 0,
      // 显示搜索条件
      showSearch: true,
      // 遮罩层
      loading: true,
      // 表单参数 
      // dialog  :model="form"
      form: {
        quantity: 1,
        assetManagerId: "",
      },
      //表单验证 用于设置表单验证规则
      //在表单元素中通过 prop 属性来绑定字段名。这样当表单提交时，Vue 会自动根据这些规则来验证数据。
      rules: {
        assetName: [
          { required: true, message: "资产名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "资产名称长度必须介于 2 和 20 之间",
            trigger: "blur",
          },
        ],
        quantity: [
          { required: true, message: "数量不能为空", trigger: "blur" }, //表示在输入框失去焦点时进行验证
        ],
        unit: [{ required: true, message: "单位不能为空", trigger: "blur" }],
        // assetType:[{required:true,message: "类型不能为空", trigger: "blur"}],
        assetManagerName: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        location: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        deptId: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
      },
      // dialog弹框是否弹出
      open: false,
      //弹出层标题
      title: "",
      //资产管理表格list
      assetsData: [],
      // 部门树选项
      deptOptions: [],
      //状态
      status: 0,
      //是否全新
      isNew: "Y",
      //是否在库
      isInStock: "Y",
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // dialog 选择性展示 添加/更新
      reveal: false,
      revealStatus: false,

      //状态对应
      statusOptions: [
        { value: 0, label: "正常" },
        { value: 1, label: "维修" },
        { value: 2, label: "报废" },
      ],
      //是否在库/是否全新
      stockAndNewOptions: [
        { value: "Y", label: "是" },
        { value: "N", label: "否" },
      ],
      //资产类型选项
      assetType: [],
      // 选中数组
      ids: [],
      names: [],
      // 员工所属人 部门tree 默认选中的 id 数组
      defaultCheckedIds: [],
      // 树形结构的属性配置
      deptProps: {
        // 配置 Tree 组件的显示属性
        label: "label", // 节点显示的字段名
        isLeaf: "isLeaf", // 是否为叶子节点（懒加载时需要）
      },
      //存储选中的节点信息，初始化为空数组。当用户勾选树节点时，这个数组会存储勾选的节点数据。
      checkedNodes: [],
      //所属人input过滤
      filterText: "",
      
    };
  },
  created() {
    this.getAssetsList();
  },
  // watch: {
  //   "form.userName"(newVal) {
  //     if (newVal && this.form.deptId) {
  //       console.log(123,this.form.deptId)
  //       this.form.deptId = ""; // 清空所属部门
  //       this.$message.warning("已选择所属人，所属部门已清空！");
  //     }
  //   },
  //   "form.deptId"(newVal) {
  //     if (newVal && this.form.userName) {
  //       this.form.userName = ""; // 清空所属人
  //       this.$message.warning("已选择所属部门，所属人已清空！");
  //     }
  //   },
  // },

  methods: {
 
    //资产类型 字典 映射
    assetTypeDict(assetType) {
      // for (let item = 0; item < this.dict.type.asset_type.length; item++) {
      //   const element = this.dict.type.asset_type[item];
      //   if (element.value === assetType) {
      //     return element.label;
      //   }
      // }

      const option = this.dict.type.asset_type.find(
        (item) => item.value === assetType
      );
      return option ? option.label : "未知状态";
    },

    // 资产管理人实时搜索展示
    handleSelect(item) {
      // 处理选中的项，显示 workId 或进行其他操作

      // 你可以根据需要更新 form 中的数据
      // 显示 value 和 workId 到输入框
      // 选择员工时，保存员工的 assetManagerId 和 assetUsername

      console.log("item1", item);

      this.form.assetManagerName = item.value;
      this.form.assetManagerId = item.userId;

      //xx?
      if (item === 2) {
        console.log("item2", item);
        console.log(`选中：${item.value}, 工作ID: ${item.workId}`);
      }
      // this.form.assetManagerId = item.userId; // 将选中的员工 ID 传给 assetManagerId
      // this.form.assetUsername = item.value; // 将选中的员工名字显示在输入框中
    },
    //所属人 实时搜索
    handleSelectUser(item) {
      console.log(`选中：${item.value}, 工作ID: ${item.workId}`);
      this.form.userName = item.value;
      this.form.userId = item.userId;
      this.form.workId = item.workId;
    },
    //// 获取数量单位 对应 unit 的 label
    getUnitLabel(unitValue) {
      const unit = this.dict.type.asset_unit.find(
        (item) => item.value === unitValue
      );
      return unit ? unit.label : "";
    },

    //资产管理人 input搜索 获取员工id 工号 姓名
    querySearch(queryString, cb) {
      if (queryString) {
        getUserInfo(queryString)
          .then((response) => {
            // const userInfo = response.data;
            //前端添加value格式对象 用el标签一定要按照它的要求对应其对象格式 《映射》
            // for (let index = 0; index < userInfo.length; index++) {
            //   userInfo[index].value=userInfo[index].userName
            // }
            cb(response.data);
          })
          .catch((error) => {
            this.$message("无数据", error);
            cb([]);
          });
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      console.log("selection", selection);
      this.ids = selection.map((item) => item.assetId);
      this.names = selection.map((item) => item.assetName);

      // 只要是选中了2条以上即不是1条情况下马上把修改按钮改成禁用
      // :disabled="single"
      this.single = selection.length != 1;
      //只有在没被选上的时候才会禁用 其他任何情况都可选中
      this.multiple = !selection.length;
    },
    //捜索
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getAssetsList();
    },
    //リセット
    resetQuery() {
      this.queryParams.assetName = undefined;
      this.queryParams.assetType = undefined;
      this.handleQuery();
      // this.resetForm("queryForm");
    },
    // フォームリセット
    reset() {
      this.form = {
        quantity: 1
      };
    },
    //弹窗关闭
    cancel() {
      this.open = false;
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
    //清空输入框后再次设置默认值,如果为空则重置为默认值
    handleBlur() {
      if (!this.form.quantity) {
        this.form.quantity = 1; //
        this.form.unit = 0;
      }
    },
    /** 查询部门下拉树结构 */
    deptTree() {
      deptTreeSelect().then((response) => {
        this.deptOptions = response?.data;
      });
    },
    //是否在库
    getStockLabel(stock) {
      console.log("stock", stock);
      const option = this.stockAndNewOptions.find(
        (item) => item.value === stock
      );
      return option ? option.label : "未知";
    },
    //是否全新
    getNewLabel(isNew) {
      const option = this.stockAndNewOptions.find(
        (item) => item.value === isNew
      );
      return option ? option.label : "未知";
    },

    //状态
    getStatusLabel(status) {
      // 根据状态值获取对应的文本标签
      console.log("status", typeof status);
      const option = this.statusOptions.find((item) => item.value === status);
      console.log(this.statusOptions);
      console.log("option", option);
      return option ? option.label : "未知";
    },
 
    // 处理树形节点的勾选
    treeCheck(currNode, { checkedKeys, checkedNodes }) {
      console.log(currNode);
      console.log({ checkedKeys, checkedNodes });
      this.checkedNodes = checkedNodes; // 存储选中的节点
    },
    getAssetsList() {
      // 全ての資産管理リストを取得
      assetsList(this.queryParams).then((response) => {
        console.log("資産管理リスト:", response);
        this.assetsData = response.rows;

        this.total = response.total;
        this.loading = false;
      });
    },

    //新增
    handleAdd() {
      this.deptTree();
      assetsList().then((response) => {
        this.open = true;
        this.revealStatus = false;//是否显示资产状态 新增时不需要显示 直接在后台默认
        console.log("quantity", this.form);
        this.title = "添加资产";
        console.log("dict", this.dict.type.asset_type);
      });
    },
    //変更
    handleUpdate(row) {
      this.deptTree();
      console.log("変更row:", row);
      this.reset();
      const assetId = row.assetId || this.ids;
      setTimeout(()=>{
      getAsset(assetId).then((response) => {
        this.form = response.data;
        // this.$set(this.form, 'deptId', 103)
        this.form.deptId = 103
        this.open = true;
        this.reveal = true;
        this.revealStatus = true;
        this.title = "資産変更";
        
      console.log("変更row:", this.form.deptId);
      });
      },500)
    },
    //削除
    handleDelete(row) {
      console.log("row", row);
      const assetIds = row.assetId || this.ids;
      const assetName = row.assetName || this.names;
      this.$modal
        .confirm('是否确认删除编号为"' + assetName + '"的数据项？')
        .then(function () {
          return delAsset(assetIds);
        })
        .then(() => {
          this.getAssetsList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
              // ... 扩展运算符，将 this.queryParams 中的参数展开并作为请求的参数传递给后端。
                    // 导出文件的名称，使用了时间戳

                    
    },
    /** 导入按钮操作 */
    handleImport() {

    },
    //提交表单
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 将 form.unit 转换为 label
          const unitLabel = this.getUnitLabel(this.form.unit);
          this.form.unit = unitLabel;
          if (this.form.assetId != undefined) {
            updateAsset(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getAssetsList();
            });
          } else {
            addAsset(this.form).then((response) => {
              console.log("submitForm:" + JSON.stringify(this.form)); // 可以查看 form 内容
              if (response.code === 200) {
                this.$modal.msgSuccess("添加成功");
                this.open = false;
                this.reset();
                this.getAssetsList();
              } else if (response.code === 400) {
                //显示错误信息  会议室冲突
                console.log("添加失败");
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style></style>
