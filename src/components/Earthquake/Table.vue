<!-- 表格组件 -->
<template>
  <div class="data-table">
    111
  </div>
</template>

<script setup name="Table">
</script>

<style scoped lang="scss">
.data-table {
  position: absolute;
  top: 65px;
  left: 20px;
  background: rgba(14, 52, 98, 0.8);
  color: white;
  padding: 15px;
  border-radius: 2px;
  z-index: 1000;
  width: 550px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  border: 1px solid rgba(0, 225, 255, 0.5);
}

.toggle-table-btn {
  position: absolute;
  top: 5px;
  left: 5px;
  background-image: linear-gradient(159deg, #1c9fff 2%, #9be7ff 128%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 20px;
  line-height: 1;
  text-align: center;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle-table-btn:hover {
  background-color: #0056b3;
}

.table-title {
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 16px;
  text-align: center;
  margin-top: 0;
  padding-top: 0px;
  color: white;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: linear-gradient(180deg, rgba(86, 204, 242, 1) 0%, rgba(47, 128, 237, 1) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 12px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.data-table td {
  background: rgba(14, 52, 98, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 12px;
  text-align: center;
  font-size: 14px;
  height: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.1);
}

.data-table tbody tr:hover {
  background-color: rgba(86, 204, 242, 0.3);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  gap: 10px;
}

.pagination-controls button {
  background-color: #3c86ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-controls button:disabled {
  background-color: #373e52;
  cursor: not-allowed;
}

.pagination-controls button:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-controls span {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.total-items {
  margin-left: 10px;
  font-size: 14px;
  color: white;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.data-table select,
.search-box input {
  height: 34px;
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(15, 61, 118, 0.6);
  color: white;
  border: 1px solid rgba(0, 225, 255, 1);
  box-sizing: border-box;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
}

.search-box input {
  flex-grow: 1;
  width: auto;
  color: white;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-box button {
  background-color: #3c86ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 34px;
  box-sizing: border-box;
  white-space: nowrap;
}

.search-box button:hover {
  background-color: #0056b3;
}

.data-table select {
  flex-shrink: 0;
  color: white;
}

.data-table select option {
  background: rgba(15, 61, 118, 0.9);
  color: white;
}

::v-deep .compass {
  position: absolute;
  top: 15px;
}

::v-deep .navigation-controls {
  position: absolute;
  top: 120px;
}
</style>
