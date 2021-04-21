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
      <span>定时任务列表</span>
      <el-button size="mini" type="primary" @click="handleAdd()" style="float: right;margin-left: 10px;">添加</el-button>
      <el-button size="mini" type="danger" @click="handleBatchDelete()"  style="float: right">批量删除</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="dataCollectionScheduleJobTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" fixed></el-table-column><!--多选框-->
        <el-table-column label="序号" width="60" align="center" type="index"></el-table-column><!--递增序号-->
        <el-table-column label="定时任务名称" min-width="150%"  align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="采集任务名称" min-width="150%"  align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.taskName}}</template>
        </el-table-column>
        <el-table-column label="cron表达式" min-width="160%"  align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.cronExpression}}</template>
        </el-table-column>
        <el-table-column label="状态" align="center" min-width="90%">
          <template slot-scope="scope">
            <div v-if="scope.row.status==='CREATED'">已创建</div>
            <div v-else-if="scope.row.status==='RUNNING'">执行中</div>
            <div v-else-if="scope.row.status==='PAUSE'">已暂停</div>
            <div v-else-if="scope.row.status==='SUCCESS'">已完成</div>
            <div v-else-if="scope.row.status==='FAIL'">执行失败</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160%" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatDateTime}}</template>
        </el-table-column>

        <el-table-column label="定时任务说明" min-width="300%" align="center">
          <template slot-scope="scope">{{scope.row.description}}</template>
        </el-table-column>

        <el-table-column label="操作" min-width="240%" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleScheduleJob(scope.$index, scope.row, 'start')">立即执行</el-button>
            <el-button size="mini" type="text" @click="handleScheduleJob(scope.$index, scope.row, 'pause')">暂停</el-button>
            <el-button size="mini" type="text" @click="handleScheduleJob(scope.$index, scope.row, 'resume')">恢复</el-button>
            <el-button size="mini" type="text" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
      :title="isEdit?'编辑定时任务':'添加定时任务'"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form :model="dataCollectionScheduleJob"
               ref="adminForm"
               label-width="150px" size="small">
        <el-form-item label="定时任务名称：">
          <el-input v-model="dataCollectionScheduleJob.name" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="采集任务选择：">
          <el-select v-model="dataCollectionScheduleJob.dataCollectionTaskId" placeholder="请选择" style="width: 250px" >
            <el-option
              v-for="item in dataCollectionTaskList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="cron表达式：">
          <el-input v-model="dataCollectionScheduleJob.cronExpression" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="定时任务描述：">
          <el-input v-model="dataCollectionScheduleJob.description"
                    type="textarea"
                    :rows="5"
                    style="width: 250px"></el-input>
        </el-form-item>
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
  import { fetchList,createScheduleJob,updateScheduleJob,deleteScheduleJob,updateStatus,run, pause,resume } from '@/api/dataCollectionScheduleJob';
  import { fetchAllTaskList } from '@/api/dataCollectionTask'

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    keyword: null
  };
  const defaultDataCollectionScheduleJob = {
    jobId: null,
    jobName: null,//定时任务名称
    dataCollectionTaskId: null,//数据采集任务id
    cronExpression: null,//cron表达式
    type: null,//定时任务类型
    status: null,//定时任务状态
    description: null,//定时任务描述
    createTime: null,//定时任务创建时间
  };
  export default {
    name: 'dataSource',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        dataCollectionScheduleJob: Object.assign({}, defaultDataCollectionScheduleJob),
        isEdit: false,
        dataCollectionTaskList: [], //已经发布的数据采集任务list
      }
    },

    async mounted() {
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
        this.dialogVisible = true;
        this.isEdit = false;
        this.getCollectionTaskListByStatus("PUBLISHED");
        this.dataCollectionScheduleJob = Object.assign({},defaultDataCollectionScheduleJob);
      },

      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.getCollectionTaskListByStatus("PUBLISHED");
        this.dataCollectionScheduleJob = Object.assign({},row);
      },

      /**执行新增或修改的方法*/
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateScheduleJob(this.dataCollectionScheduleJob.id,this.dataCollectionScheduleJob).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createScheduleJob(this.dataCollectionScheduleJob).then(response => {
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
        this.$confirm('是否要删除该数据源?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteScheduleJob(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
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
            message: '请选择定时任务'
          });
          return;
        }
        var ids = [];
        this.multipleSelection.forEach(item=>{
          ids.push(item.id);
        });
        this.$confirm('是否要删除定时任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteScheduleJob(ids).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },

      /**获取已经发布的数据采集任务列表*/
      async getCollectionTaskListByStatus(status) {
        var statusObj = {status : status};
        await fetchAllTaskList(statusObj).then(response =>{
          var dataCollectionTaskList = [];
          if(response.data && response.data.length>0) {
            for (var i=0; i<response.data.length; i++) {
              dataCollectionTaskList.push(
                {
                  value: response.data[i].id,
                  label: response.data[i].taskName,
                }
              );
            }
            this.dataCollectionTaskList = dataCollectionTaskList;
          }
        });
      },

      /**定时任务 开始/暂停/恢复 */
      handleScheduleJob(index,row,type){
        var jobId = row.id;
        var jobIds = [];
        jobIds.push(jobId);
        var msg = '';
        if (type === 'start') {
          msg = '是否要开始定时任务';
        }else if (type === 'pause') {
          msg = '是否要开始定时任务';
        }else {
          msg = '是否要恢复定时任务';
        }
        this.$confirm('是否要开始定时任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(type === 'start') {
            run(jobIds).then(response => {
              this.$message({
                type: 'success',
                message: '任务开始!'
              });
              this.getList();
            });
          }else if (type === 'pause') {
            pause(jobIds).then(response => {
              this.$message({
                type: 'success',
                message: '任务暂停!'
              });
              this.getList();
            });
          }else {
            resume(jobIds).then(response => {
              this.$message({
                type: 'success',
                message: '任务恢复!'
              });
              this.getList();
            });
          }
        });
      },

      /**定时任务列表*/
      async getList() {
        await this.getCollectionTaskListByStatus(null);
        this.listLoading = true;
        await fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
          this.list.forEach(scheduleJob=>{
            this.dataCollectionTaskList.forEach(task=>{
              if (scheduleJob.dataCollectionTaskId == task.value) {
                scheduleJob.taskName = task.label;
              }
            });
          });
        });
      }
    }
  }
</script>
<style></style>


