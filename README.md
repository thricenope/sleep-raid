# 梦境讨伐队 SleepRaid 🗡️🌙

> 在线体验：<https://thricenope.github.io/sleep-raid/>（数据存在浏览器本地，换设备请用应用内导出/导入）

> 每晚入睡 = 出征梦境地下城；每晚睡得好 = 击败梦魇怪、推进讨伐关卡！

「梦境讨伐队」是一款**闯关打怪**风格的 Q 版睡眠打卡游戏——「网游式回合战斗」皮肤的健康应用第四弹（独立于减肥三兄弟）。

## 玩法

每天记录**昨晚睡眠** + **今晚上床**，系统换算成对「梦魇怪」的伤害：

| 战况 | 效果 |
| --- | --- |
| 昨晚战报（入睡/起床时间、夜醒次数、晨起状态） | 决定昨晚地下城的战斗结算 |
| 今晚上床预告（预计几点睡） | 决定出征阵容的攻击力加成 |
| 分数 ≥ 2 | 击退梦魇怪，关卡通过 ✓ |
| 分数 ≥ 6 | 暴击击败，梦魇怪进化为梦境精灵加入图鉴 |
| 连续通过 | 推进「讨伐之路」，解锁段位称号 |

## 运行

```bash
npm install
npm run dev      # http://localhost:5192
npm run build    # 产物在 dist/
```

## 与其他应用的关系

| 应用 | 主题 | 端口 | localStorage key |
| --- | --- | --- | --- |
| slim-quest 燃脂消消乐 | 减肥 · 消除 | 5188 | `slim-quest-v1` |
| slim-stars 摘星计划 | 减肥 · 星空 | 5189 | `slim-stars-v1` |
| sleep-zoo 睡眠动物园 | 睡眠 · 动物园 | 5190 | `sleep-zoo-v1` |
| slim-hero 燃脂勇者 | 减肥 · 打怪 | 5191 | `slim-hero-v1` |
| **sleep-raid 梦境讨伐队** | **睡眠 · 打怪** | **5192** | **`sleep-raid-v1`** |

五个应用**完全独立**：目录、端口、存储键互不共享，数据互不影响。

## 技术栈

Vite 5 · React 18 · TypeScript(strict) · zustand(persist) · framer-motion · canvas-confetti
全部插画为手绘 SVG，无位图资源。
