---
name: 梦境讨伐队 SleepRaid
description: 梦境地下城主题的睡眠打卡 RPG 设计系统
colors:
  bg: "#FFF6EC"
  bg-deep: "#FFE8D2"
  ink: "#3E3157"
  ink-2: "#776B99"
  ink-3: "#A79BC4"
  card: "#FFFFFF"
  line: "#EADFD0"
  line-strong: "#DCCBB4"
  moon: "#FFB84A"
  moon-deep: "#8A5A00"
  dream: "#7C6BFF"
  dream-deep: "#4A38C9"
  victory: "#2ED3A3"
  victory-deep: "#0E8F6C"
  hp: "#FF5D8F"
  night: "#2B2551"
typography:
  display:
    fontFamily: "'ZCOOL QingKe HuangYou', 'PingFang SC', sans-serif"
    fontWeight: 400
    letterSpacing: "0.02-0.08em"
  body:
    fontFamily: "ui-rounded, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "15px"
    lineHeight: 1.55
  num:
    fontFamily: "'Baloo 2', var(--font-display), sans-serif"
    fontWeight: 600-800
    fontVariantNumeric: tabular-nums
rounded:
  sm: "12-14px"
  md: "16-18px"
  lg: "20-26px"
components:
  button-primary:
    backgroundColor: "linear-gradient(180deg,#9A82FF,#6A55E8)"
    textColor: "#FFFFFF"
    typography: "{typography.display}"
    rounded: "20px"
    padding: "16px"
    shadow: "0 6px 0 #4A38C9"
  chip-selected:
    backgroundColor: "linear-gradient(180deg,#9A82FF,#6A55E8)"
    textColor: "#FFFFFF"
    shadow: "0 3px 0 #4A38C9"
  chip-selected-mint:
    backgroundColor: "linear-gradient(180deg,#17A583,#0E8F6C)"
    shadow: "0 3px 0 #0A6B50"
---

# Design System: 梦境讨伐队 SleepRaid

## Overview

**Creative North Star: 「梦境地下城·月光远征」**

用户是「梦境讨伐队」的队长：每晚睡前派出睡帽小队出征，梦魇怪在关卡里把守；早晨回来结算战报，梦魇怪被打得眼冒星星退场。暖夜米白是月光下的羊皮纸地图，梦紫是魔法与关卡，月金是战利品。

**Key Characteristics:**
- 暖夜米白底 + 梦紫（魔法/主行动）+ 月金（战利品/暴击）+ 信号绿（成功语义）
- 控件 = 果冻按钮 + 实体投影（0 6px 0 深色底边），按下去物理下沉
- ZCOOL QingKe HuangYou 做战斗横幅，Baloo 2 做全部数字读数
- 庆祝 = 星月彩带 + 怪物昏厥动画（X 眼 + 吐舌头 + 转圈星星）

## Colors

### Primary
- **梦紫**（#7C6BFF）：出征按钮、选中态、当前节点、图鉴主题。深底 #4A38C9 做投影与描边。
- **月金**（#FFB84A）：战利品、暴击文字、经验条、胜利旗。
- **信号绿**（#2ED3A3 / 深 #0E8F6C）：成功语义——晨起状态选中、通过关卡、导出按钮。
- **HP 莓红**（#FF5D8F）：怪物血条专用。

### Neutral
- bg #FFF6EC（月光羊皮纸）、卡片 #FFFFFF、线 #EADFD0、墨 #3E3157。
- 梦境深夜色 #2B2551 仅用于夜间场景渐变与遮罩。

## Layout

- 430px 单列；页面纵向滚动；底部 5 列悬浮 TabBar（毛玻璃 + 实体投影）。
- 战斗场景：170px 高的横版舞台，左小勇者右大怪物，底部云丘；伤害数字从怪物头顶飘出。

## Motion

- 全局 spring 弹性（stiffness 300–380 / damping 16–20）
- 出手：勇者挥剑 0.6s，怪物左右震动 shake，伤害数字上飘
- 暴击：金色「会心一击！」+ 全屏彩带
- 关卡通过：怪物昏厥旋转 + 胜利旗插地
- prefers-reduced-motion: 所有动画时长压到 0.01ms

## Voice & Tone

- 梦魇怪全部**搞笑夸张、绝不羞辱**：战败时怪物得瑟但卖萌，绝不指责用户
- 台词用游戏黑话：「击退」「暴击」「讨伐」「关卡」「连击」
- 用户称「队长」，队伍称「讨伐队」
