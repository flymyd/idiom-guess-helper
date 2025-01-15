<script setup>
import { findMatchingIdioms } from "./core/guess_idiom.js";
import idiomsDict from "./assets/cleaned_idiom.min.json";
import { ref, computed } from "vue";

const idioms = idiomsDict;

const createDefaultChar = () => ({
  initial: 'X',
  final: 'X',
  tone: ''
});

const characters = ref([
  createDefaultChar(),
  createDefaultChar(),
  createDefaultChar(),
  createDefaultChar()
]);

const pattern = computed(() => {
  return characters.value.map(char => {
    // 声母和韵母都为空，返回X加音调
    if (!char.initial && !char.final) {
      return `X-${char.tone || 'X'}`;
    }

    // 只填韵母视为零声母音节
    if (!char.initial && char.final) {
      return `${char.final}-${char.tone || 'X'}`;
    }

    const initial = char.initial || 'X';
    // 普通音节需要声母和韵母
    if (!char.final) {
      return `${initial}-${char.tone || 'X'}`;
    }
    return `${initial}'${char.final}-${char.tone || 'X'}`;
  }).join(',');
});

const matches = ref([]);
const totalMatches = ref(0);
const MAX_DISPLAY_RESULTS = 20;

const searchIdioms = () => {
  console.log(pattern.value);
  const allMatches = findMatchingIdioms(pattern.value, idioms);
  totalMatches.value = allMatches.length;
  matches.value = allMatches.slice(0, MAX_DISPLAY_RESULTS);
};

const clearForm = () => {
  characters.value = characters.value.map(() => createDefaultChar());
  matches.value = [];
  totalMatches.value = 0;
};

const rules = {
  tone: [
    { pattern: /^[0-4X]$|^$/, message: '音调必须是0-4的数字或X' }
  ]
};

const helpDialogVisible = ref(false);

const helpContent = [
  {
    title: '简介',
    items: [
      '这是一款基于拼音分解的成语查找工具，可以帮助你快速找到与给定拼音匹配的成语。',
      '人人都可以是花蛤！'
    ]
  },
  {
    title: '基本规则',
    items: [
      '每个汉字由声母、韵母和音调三部分组成',
      '所有未填写的内容将自动用X代替（除了韵母）',
      '支持使用X作为通配符匹配任意内容'
    ]
  },
  {
    title: '声母填写',
    items: [
      '声母留空时默认为X（匹配任意声母）',
      '零声母音节（如"啊"、"饿"等）不需要填写声母，直接填写韵母即可',
      '可以填写具体声母如：b, p, m, f, d, t, n, l等'
    ]
  },
  {
    title: '韵母填写',
    items: [
      '可以直接填写韵母如：a, o, e, i, u, v等（用于零声母音节）',
      '也可以填写复合韵母如：ai, ei, ao, ou等',
      '韵母可以留空（用于匹配任意韵母）'
    ]
  },
  {
    title: '音调填写',
    items: [
      '音调留空时默认为X（匹配任意音调）',
      '可以填写0-4的数字（0表示轻声）',
      '填写X表示匹配任意音调'
    ]
  },
  {
    title: '使用示例',
    items: [
      '查找"来"字：l/ai/2 或 l/ai/X',
      '查找"饿"字：e/2（零声母音节直接填写韵母）',
      '查找任意音调的"啊"字：a/X',
      '完全通配：X/X（匹配任意字）'
    ]
  }
];
</script>

<template>
  <div class="container">
    <div class="header">
      <h2>于睿の秘密</h2>
      <el-button @click="helpDialogVisible = true" class="help-button">
        使用帮助
      </el-button>
    </div>

    <div class="card-container">
      <el-card v-for="(char, index) in characters" :key="index" class="input-card">
        <template #header>
          <div class="card-header">
            第{{ index + 1 }}个字
          </div>
        </template>
        <el-form :model="char" :rules="rules" label-position="top" class="compact-form">
          <div class="form-row">
            <el-form-item label="声母" prop="initial">
              <el-input v-model="char.initial" placeholder="默认X" />
            </el-form-item>
            <el-form-item label="韵母" prop="final">
              <el-input v-model="char.final" placeholder="留空=无韵母" />
            </el-form-item>
            <el-form-item label="音调" prop="tone">
              <el-input v-model="char.tone" placeholder="默认X" />
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </div>

    <div class="button-container">
      <el-button type="primary" @click="searchIdioms" class="action-button">查找成语</el-button>
      <el-button type="warning" @click="clearForm" class="action-button">清空输入</el-button>
    </div>

    <div v-if="totalMatches > 0" class="results">
      <h3>
        找到 {{ totalMatches }} 个匹配
        <span v-if="totalMatches > MAX_DISPLAY_RESULTS" class="results-note">
          (仅显示前{{ MAX_DISPLAY_RESULTS }}条)
        </span>
      </h3>
      <div class="results-grid">
        <el-card v-for="(match, index) in matches" :key="index" class="result-card">
          <h4>{{ match.word }}</h4>
          <p>拼音: {{ match.pinyin }}</p>
          <p>拆分: {{ match.split_pinyin }}</p>
        </el-card>
      </div>
    </div>

    <el-dialog
      v-model="helpDialogVisible"
      width="90%"
      max-width="600px"
    >
      <div class="help-content">
        <div v-for="(section, index) in helpContent" :key="index" class="help-section">
          <h3>{{ section.title }}</h3>
          <ul>
            <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
              {{ item }}
            </li>
          </ul>
        </div>
        <p>Powered by 绝代天骄-不吵 aka 段锻椴</p>
        <p>favicon <a href="https://weibo.com/u/2151719441">@风花雪月校长</a></p>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.input-card {
  margin-bottom: 0;
  min-height: 140px;
}

.input-card :deep(.el-card__header) {
  padding: 8px 12px;
}

.input-card :deep(.el-card__body) {
  padding: 12px;
  position: relative;
}

.card-header {
  font-weight: bold;
  color: #409EFF;
  font-size: 0.95rem;
}

.compact-form :deep(.el-form-item) {
  margin-bottom: 8px;
  min-height: 80px;
}

.compact-form :deep(.el-form-item__label) {
  padding-bottom: 2px;
  line-height: 1.2;
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.2fr;
  gap: 8px;
}

.button-container {
  text-align: center;
  margin: 16px 0;
}

.action-button {
  margin: 0 8px;
}

.results {
  margin-top: 24px;
}

.results h3 {
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.result-card {
  margin-bottom: 0;
}

.result-card :deep(.el-card__body) {
  padding: 12px;
}

.result-card h4 {
  margin: 0 0 8px 0;
  color: #409EFF;
  font-size: 1.1rem;
}

.result-card p {
  margin: 4px 0;
  color: #666;
  font-size: 0.9rem;
}

.results-note {
  font-size: 0.9rem;
  color: #909399;
  font-weight: normal;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.header h2 {
  margin: 0;
  color: #409EFF;
  flex: 1;
}

.help-button {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.help-content {
  padding: 0 8px;
}

.help-section {
  margin-bottom: 16px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  color: #409EFF;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.help-section ul {
  margin: 0;
  padding-left: 16px;
}

.help-section li {
  margin-bottom: 6px;
  color: #606266;
  line-height: 1.4;
}

.help-section li:last-child {
  margin-bottom: 0;
}

.help-section :deep(.el-form-item__error) {
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 2px;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 12px 16px 8px;
}

:deep(.el-dialog__body) {
  padding: 8px 16px 16px;
}

@media (max-width: 640px) {
  .container {
    padding: 8px;
  }

  .card-container {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .help-button {
    align-self: center;
  }
}
</style>
