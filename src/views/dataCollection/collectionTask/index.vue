<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="success"
          @click="handleSearchList()"
          size="small">
          查询搜索
        </el-button>
        <el-button
          type="warning"
          style="float:right;margin-right: 10px;"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="数据源名称" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>采集任务列表</span>
      <el-button size="mini" type="primary" @click="handleAdd()" style="float: right;margin-left: 10px;">添加</el-button>
      <el-button size="mini" type="danger" @click="handleBatchDelete()"  style="float: right">批量删除</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="collectionTaskTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" fixed></el-table-column><!--多选框-->
        <el-table-column label="序号" width="60" align="center" type="index"></el-table-column><!--递增序号-->
        <el-table-column label="采集任务名称" min-width="22%" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.taskName}}</template>
        </el-table-column>
        <el-table-column label="输入数据源名称" min-width="22%" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.importDataSourceName}}</template>
        </el-table-column>
        <el-table-column label="输出数据源名称" min-width="22%" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.exportDataSourceName}}</template>
        </el-table-column>
<!--        <el-table-column label="是否配置字段映射" width="135" align="center">-->
<!--          <template slot-scope="scope">{{scope.row.isNeedMapper == '0' ? '否' : '是'}}</template>-->
<!--        </el-table-column>-->
        <el-table-column label="创建时间" min-width="18%" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatDateTime}}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="16%" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" :disabled="scope.row.status!=='CREATED'&&scope.row.status!=='REVOKED'"
                       @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button size="mini" type="text" :disabled="scope.row.status!=='CREATED'&&scope.row.status!=='REVOKED'"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
            <!--只有已创建和已下架的数据采集任务才能发布-->
            <el-button size="mini" type="text"
                       @click="handleUpdateStatus('PUBLISHED', scope.row)" v-if="scope.row.status==='CREATED'||scope.row.status==='REVOKED'">发布
            </el-button>
            <el-button size="mini" type="text"
                       @click="handleUpdateStatus('REVOKED', scope.row)" v-if="scope.row.status==='PUBLISHED'">下架
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[10,15,20]"
        :total="total">
      </el-pagination>
    </div>

    <!--数据源添加、编辑-->
    <el-dialog
      :title="isEdit?'编辑数据采集任务':'添加数据采集任务'"
      :visible.sync="dialogVisible"
      width="65%"
      @open="toggleSelection">
      <!--采集任务基本信息-->
<!--      <el-form>-->
<!--        <el-form-item style="font-family: 微软雅黑;font-weight: bold;margin-top: -30px;">采集任务基本信息</el-form-item>-->
<!--      </el-form>-->
      <el-form :model="dataCollectionTask"
               ref="dataCollectionTask"
               label-width="125px" size="small">
        <el-form-item label="采集任务名称：">
          <el-input v-model="dataCollectionTask.taskName" style="width: 230px"></el-input>
        </el-form-item>
        <el-form-item label="采集任务说明：" style="float: right; margin-top: -50px">
          <el-input v-model="dataCollectionTask.taskDesc" style="width: 230px"></el-input>
        </el-form-item>
      </el-form>
      <!--输入数据源配置-->
<!--      <el-form>-->
<!--        <el-form-item style="font-family: 微软雅黑;font-weight: bold;margin-top: -30px;">输入数据源配置</el-form-item>-->
<!--      </el-form>-->
      <el-form ref="adminForm"
               label-width="125px" size="small">
        <el-form-item label="输入数据源选择：">
          <el-select v-model="dataCollectionTask.importDataSourceId" placeholder="请选择" style="width: 230px" @change="changeImportOrExportList('export',dataCollectionTask)">
            <el-option
              v-for="item in importDataSourceList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="tableData"
               label-width="125px" size="small">
        <el-form-item label="字段选择：">
          <el-table
            :data="tableData"
            style="width: 100%" border>
            <el-table-column label="表名" min-width="18%">
              <template slot-scope="scope">{{scope.row.tableName}}</template>
            </el-table-column>
            <el-table-column
              prop="fieldList"
              label="字段选择"
              min-width="82%">
              <template slot-scope="scope">
                <el-table :ref="scope.row.tableName"
                          :data="scope.row.fieldList"
                          style="width: 100%; font-size: 12px;"
                          :row-style="{height: '0'}"
                          :cell-style="{padding: '0'}"
                          @selection-change="handleSelectTableField($event, scope.row.tableName, scope.row.primaryKey)"
                          v-loading="listLoading" border>
                  <el-table-column type="selection" width="40" fixed></el-table-column><!--多选框-->
                  <el-table-column label="字段名称" min-width="30%" align="center">
                    <template slot-scope="scope">{{scope.row.columnName}}</template>
                  </el-table-column>
                  <el-table-column label="字段类型"  min-width="25%" align="center">
                    <template slot-scope="scope">{{scope.row.columnType}}</template>
                  </el-table-column>
                  <el-table-column label="字段注释"  min-width="30%" align="center">
                    <template slot-scope="scope">{{scope.row.remarks}}</template>
                  </el-table-column>
                  <el-table-column label="字段大小"  min-width="15%" align="center">
                    <template slot-scope="scope">{{scope.row.columnSize}}</template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <!--输出数据源配置-->
<!--      <el-form>-->
<!--        <el-form-item style="font-family: 微软雅黑;font-weight: bold;margin-top: 20px;">输出数据源配置</el-form-item>-->
<!--      </el-form>-->
      <el-form ref="adminForm"
               label-width="125px" size="small">
        <el-form-item label="输出数据源选择：">
          <el-select v-model="dataCollectionTask.exportDataSourceId" placeholder="请选择" style="width: 230px" @change="changeImportOrExportList('import',dataCollectionTask)">
            <el-option
              v-for="item in exportDataSourceList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item label="是否需字段映射：">-->
<!--          <el-radio-group v-model="dataCollectionTask.isNeedMapper" size="mini">-->
<!--            <el-radio :label="0" border>否</el-radio>-->
<!--            <el-radio :label="1" border>是</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
  import { formatDate } from '@/utils/date';
  import { fetchList,createDataCollectionTask,updateDataCollectionTask,deleteDataCollectionTask,updateStatus } from '@/api/dataCollectionTask';
  import { fetchAllList } from '@/api/dataSource';
  import { dataSourceType } from "@/utils/constant";
  import { getTableField } from '@/api/mysql'

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    keyword: null
  };
  const defaultDataCollectionTask = {
    id: null,
    taskName: null,//采集任务名称
    taskDesc: null,//采集任务描述
    importDataSourceId: null,//输入数据源id
    importDataSourceName: null,//输入数据源名称
    selectedTablesFields: null, //已选择的输入数据源的库表字段信息
    exportDataSourceId: null,//输出数据源id
    exportDataSourceName: null, //输出数据源名称
    // isNeedMapper: 0,//是否需要配置字段映射，0:否；1:是
    mapTablesFields: null,//已选择的库表字段及映射
  };
  export default {
    name: 'collectionTask',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        dataCollectionTask: Object.assign({}, defaultDataCollectionTask),
        isEdit: false,
        dataSourceTypes: dataSourceType,
        multipleSelection: [],
        // isNeedMapper: 0, //是否需要库表字段映射，默认否
        importDataSourceList:[], //输入数据源选择列表
        exportDataSourceList:[], //输出数据源选择列表
        tableData: [], //表数据
        isIndeterminate: true,
        checkAll: false,
        columnName:'',
        selectedImportDataSource:[],//已选择的输入数据源的相关信息
        selectedTablesFieldsJsonObjList: [], //点击编辑时已选择的输入数据源相关信息（json对象数组）
        selectedTables: [] //已选择的表list
      }
    },

    //页面加载完成调用
    async mounted(){
      //获取所有的采集任务列表
      await this.getList();
    },
    filters: {
      formatDateTime(time) {
        if (time == null || time === '') {
          return '';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    },
    methods: {
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      //多选时暂存多选的信息
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleAdd() {
        this.tableData=[];//新增时清空表结构，防止点击编辑后，再点击新增，会加载表结构信息的问题
        this.dialogVisible = true;
        this.isEdit = false;
        this.dataCollectionTask = Object.assign({},defaultDataCollectionTask);
      },

      /**编辑数据采集任务*/
      async handleUpdate(index, row) {
        if (row) {
          this.listLoading=true;//要加载的数据太多的时候，需要loading等待提示
          //编辑时加载库表信息
          await this.changeImportOrExportList('export',row);
          this.selectedTablesFieldsJsonObjList =  JSON.parse(row.selectedTablesFields);
          this.dialogVisible = true;
          this.isEdit = true;
          this.listLoading=false;
          this.dataCollectionTask = Object.assign({},row);
        }
      },

      /**执行新增或修改的方法*/
      handleDialogConfirm() {
        this.dataCollectionTask.selectedTablesFields = JSON.stringify(this.selectedImportDataSource);//已选择的输入数据源库表字段信息赋值
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateDataCollectionTask(this.dataCollectionTask.id, this.dataCollectionTask).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createDataCollectionTask(this.dataCollectionTask).then(response => {
              this.$message({
                message: '添加成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          }
        })
      },
      /**执行删除操作*/
      handleDelete(index, row) {
        this.$confirm('是否要删除该采集任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteDataCollectionTask(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },

      /**执行修改生命周期操作*/
      handleUpdateStatus(index, row) {
        var message = '';
        if (index === 'PUBLISHED') {
          message = '发布';
        }else {
          message = '下架';
        }
        this.$confirm('是否要'+message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, {status: index}).then(response => {
            this.$message({
              type: 'success',
              message: message+'成功!'
            });
            this.getList();
          });
        });
      },

      /**批量删除数据源*/
      handleBatchDelete() {
        if (!this.multipleSelection || this.multipleSelection.length==0) {
          this.$message({
            type: 'warning',
            message: '请选择数据源'
          });
          return;
        }
        var ids = [];
        this.multipleSelection.forEach(item=>{
          ids.push(item.id);
        });
        this.$confirm('是否要删除采集任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteDataCollectionTask(ids).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },

      /**
       * 获取所有的输入/输出数据源（不分页）
       */
      async getAllDataSource(status) {
        var statusObj = {status : status};
        await fetchAllList(statusObj).then(response =>{
          if(response.data && response.data.length>0) {
            var importDataSourceList = [];
            var exportDataSourceList = [];
            for (var i=0; i<response.data.length; i++) {
              importDataSourceList.push(
                {
                  value: response.data[i].id,
                  label: response.data[i].name,
                  dbInfo: {
                    driverClassName: response.data[i].driverClassName,
                    linkedUrl: response.data[i].linkedUrl,
                    username: response.data[i].username,
                    password: response.data[i].password
                  }
                }
              );
              exportDataSourceList.push(
                {
                  value: response.data[i].id,
                  label: response.data[i].name
                }
              );
            }
            this.importDataSourceList = importDataSourceList;
            this.exportDataSourceList = exportDataSourceList;
          }
        });
      },

      /**
       * 选择输入或输出数据源时，屏蔽已选择的输入或输出数据源
       */
      async changeImportOrExportList(type, row) {
        await this.getAllDataSource("PUBLISHED");
        //选择输入数据源时，在输出数据源列表过滤掉已选择的输入数据源
        if (type === 'export') {
          this.listLoading=true;
          for (var i=0; i<this.exportDataSourceList.length; i++) {
            if (this.exportDataSourceList[i].value === row.importDataSourceId) {
              this.exportDataSourceList.splice(i, 1);
            }
          }
          if (this.dataCollectionTask.exportDataSourceId) {
            for (var i=0; i<this.importDataSourceList.length; i++) {
              if (this.importDataSourceList[i].value === this.dataCollectionTask.exportDataSourceId) {
                this.importDataSourceList.splice(i, 1);
              }
            }
          }
          //选择完输入数据源后，需要从后台加载数据源信息
          await this.getTablesFields(this.importDataSourceList.find(list=>{ return list.value === row.importDataSourceId}).dbInfo);
          this.listLoading=false;
        }//选择输出数据源时，在输入数据源列表过滤掉已选择的输出数据源
        else if (type === 'import') {
          for (var i=0; i<this.importDataSourceList.length; i++) {
            if (this.importDataSourceList[i].value === row.exportDataSourceId) {
              this.importDataSourceList.splice(i, 1);
            }
          }
          if (this.dataCollectionTask.importDataSourceId) {
            for (var i=0; i<this.exportDataSourceList.length; i++) {
              if (this.exportDataSourceList[i].value === this.dataCollectionTask.importDataSourceId) {
                this.exportDataSourceList.splice(i, 1);
              }
            }
          }
          this.listLoading=false;
        }
      },

      /**
       * 根据数据库名获取该库下所有表结构信息
       */
      async getTablesFields(databaseParam){
        await getTableField(databaseParam).then(response => {
          var tableFieldInfoList = response.data.tableFieldInfoList;
          if (tableFieldInfoList && tableFieldInfoList.length>0) {
            this.tableData = [];//清空
            for (var i=0; i<tableFieldInfoList.length; i++) {
              var everyTableFieldList = tableFieldInfoList[i].fieldInfoList;
              var fieldList = [];
              for (var j=0; j<everyTableFieldList.length; j++) {
                fieldList.push({
                  columnName: everyTableFieldList[j].columnName, //字段名称
                  columnType: everyTableFieldList[j].columnType, //字段类型
                  columnSize: everyTableFieldList[j].columnSize, //字段大小
                  remarks: everyTableFieldList[j].remarks, //字段说明
                  decimalDigits: everyTableFieldList[j].decimalDigits, //精度
                  isAutoIncrement: everyTableFieldList[j].isAutoIncrement, //是否自增
                  nullable: everyTableFieldList[j].nullable //是否可以为null
                })
              }
              this.tableData.push({
                tableName: tableFieldInfoList[i].tableName, //表名
                primaryKey: tableFieldInfoList[i].primaryKey, //主键
                fieldList: fieldList //字段信息
              });
            }
          }
        });
      },

      /**在选择字段时处理已选择的表和字段（每次选择都重新组装数据）*/
      handleSelectTableField(val, tableName, primaryKey){
        if (this.selectedImportDataSource && this.selectedImportDataSource.length>0) {
          if (!isInArray(this.selectedTables, tableName)) {
            this.selectedImportDataSource.push({tableName: tableName, fieldList: val, primaryKey: primaryKey});
            this.selectedTables.push(tableName);
          }else {
            if (val.length == 0) {
              for (var i=0; i<this.selectedImportDataSource.length; i++) {
                if (this.selectedImportDataSource[i].tableName === tableName) {
                  this.selectedImportDataSource.splice(i, 1); //如果清空全选，就删除元素
                }
              }
              //删除记录的已选表
              this.selectedTables.splice(this.selectedTables.contains(tableName), 1);
            }else { //否则，替换原来的元素内容
              for (var i=0; i<this.selectedImportDataSource.length; i++) {
                if (this.selectedImportDataSource[i].tableName === tableName) {
                  this.selectedImportDataSource[i] = {tableName: tableName, fieldList: val, primaryKey: primaryKey}
                }
              }
            }
          }
        }else {
          this.selectedImportDataSource.push({tableName: tableName, fieldList: val, primaryKey: primaryKey});
          this.selectedTables.push(tableName);
        }
      },

      //编辑时对已选中的表和字段进行回显（选中状态）
      toggleSelection() {
        this.$nextTick(()=>{
          this.selectedTablesFieldsJsonObjList.forEach(tableField=>{
            tableField.fieldList.forEach(ele=>{
              this.$refs[tableField.tableName].data.forEach((fields,index)=> {
                if (fields.columnName === ele.columnName) {
                  this.$refs[tableField.tableName].toggleRowSelection(this.$refs[tableField.tableName].data[index])
                }
              })
            })
          })
        })
      },

      /**获取采集任务列表*/
      async getList() {
        this.listLoading = true;
        await this.getAllDataSource("PUBLISHED");
        await fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.list.forEach(dataSourceTask=>{
            //将输入数据源名称和输出数据源名称显示在列表
            this.importDataSourceList.forEach(dataSource=>{
              if (dataSourceTask.importDataSourceId == dataSource.value) {
                dataSourceTask.importDataSourceName = dataSource.label;
              }
              if (dataSourceTask.exportDataSourceId == dataSource.value) {
                dataSourceTask.exportDataSourceName = dataSource.label;
              }
            });
          });
          this.total = response.data.total;
        });
      }
    }
  }
  /**判断是否在在数组中已存在*/
  function isInArray(arr, el) {
    return arr.indexOf(el) == -1 ? false : true;
  }
  /**判断一个元素是否在数组中，仅支持简单数组*/
  Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
      if (this[i] === obj) {
        return i; // 返回的这个 i 就是元素的索引下标，
      }
    }
    return false;
  }
</script>
<style></style>


