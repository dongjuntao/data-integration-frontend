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
      <span>数据源列表</span>
      <el-button size="mini" type="primary" @click="handleAdd()" style="float: right;margin-left: 10px;">添加</el-button>
      <el-button size="mini" type="danger" @click="handleBatchDelete()"  style="float: right">批量删除</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="dataSourceTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" fixed></el-table-column><!--多选框-->
        <el-table-column label="序号" width="60" align="center" type="index"></el-table-column><!--递增序号-->
        <el-table-column label="数据源名称" min-width="150%" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="数据源类型" min-width="100%" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.type}}</template>
        </el-table-column>
        <el-table-column label="驱动名称" min-width="200%"  align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.driverClassName}}</template>
        </el-table-column>
        <el-table-column label="数据库连接URL" min-width="280%" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.linkedUrl}}</template>
        </el-table-column>
        <el-table-column label="数据库用户名" min-width="110%"  align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.username}}</template>
        </el-table-column>
        <el-table-column label="数据库密码" min-width="120%"  align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.password}}</template>
        </el-table-column>
        <el-table-column label="状态" align="center" min-width="100%">
          <template slot-scope="scope">
            <div v-if="scope.row.status==='CREATED'">已创建</div>
            <div v-else-if="scope.row.status==='PUBLISHED'">已发布</div>
            <div v-else-if="scope.row.status==='REVOKED'">已下架</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160%" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatDateTime}}</template>
        </el-table-column>

        <el-table-column label="数据源说明" min-width="300%" align="center">
          <template slot-scope="scope">{{scope.row.description}}</template>
        </el-table-column>

        <el-table-column label="操作" min-width="200%"  align="center" fixed="right">
          <!--已经发布的数据源无法删除和修改-->
          <template slot-scope="scope">
            <el-button size="mini" type="text" :disabled="scope.row.status!=='CREATED'&&scope.row.status!=='REVOKED'"
                       @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button size="mini" type="text" :disabled="scope.row.status!=='CREATED'&&scope.row.status!=='REVOKED'"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
            <el-button size="mini" type="text"
                       @click="handleTest(scope.$index, scope.row)">测试
            </el-button>
            <!--只有已创建和已下架的数据源才能发布-->
            <el-button size="mini" type="text"
                       @click="handleUpdateStatus('PUBLISHED', scope.row)" v-if="scope.row.status==='CREATED'||scope.row.status==='REVOKED'">发布
            </el-button>
            <el-button size="mini" type="text"
                       plain @click="handleUpdateStatus('REVOKED', scope.row)" v-if="scope.row.status==='PUBLISHED'">下架
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
      :title="isEdit?'编辑数据源':'添加数据源'"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form :model="dataSource"
               ref="adminForm"
               label-width="150px" size="small">
        <el-form-item label="数据源名称：">
          <el-input v-model="dataSource.name" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="数据源类型：">
          <el-select v-model="dataSource.type" placeholder="请选择" style="width: 250px" >
            <el-option
              v-for="item in dataSourceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="驱动名称：">
          <el-input v-model="dataSource.driverClassName" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="数据库连接URL：">
          <el-input v-model="dataSource.linkedUrl" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="数据库用户名：">
          <el-input v-model="dataSource.username" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="数据库密码：">
          <el-input v-model="dataSource.password" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="数据源说明：">
          <el-input v-model="dataSource.description"
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
  import { fetchList,createDataSource,updateDataSource,deleteDataSource,updateStatus } from '@/api/dataSource';
  import { dataSourceType } from "@/utils/constant";
  import { isConnected } from "@/api/mysql"

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    keyword: null
  };
  const defaultDataSource = {
    id: null,
    name: null,//数据源名称
    type: null,//数据源类型
    driverClassName: null,//驱动名称
    linkedUrl: null,//驱动连接URL
    username: null,//数据库用户名
    password: null,//数据库密码
    description: null,//数据源描述
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
        dataSource: Object.assign({}, defaultDataSource),
        isEdit: false,
        dataSourceTypes: dataSourceType,
        multipleSelection: [],
      }
    },
    created() {
      this.getList();
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
        this.dataSource = Object.assign({},defaultDataSource);
      },

      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.dataSource = Object.assign({},row);
      },

      /**执行新增或修改的方法*/
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateDataSource(this.dataSource.id,this.dataSource).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createDataSource(this.dataSource).then(response => {
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
          deleteDataSource(row.id).then(response => {
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
        this.$confirm('是否要删除数据源?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteDataSource(ids).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },

      /**测试数据是否连通*/
      handleTest(index, row){
        this.listLoading=true;
        var data = {
          driverClassName: row.driverClassName,
          linkedUrl: row.linkedUrl,
          username: row.username,
          password: row.password
        }
        isConnected(data).then(response=>{
          if (response.data) {
            this.$message({
              type: 'success',
              message: '连接成功!'
            });
          }else {
            this.$message({
              type: 'warning',
              message: '连接失败!'
            });
          }
          this.listLoading=false;
        });

      },

      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      }
    }
  }
</script>
<style></style>


