---
name: notes
description: 当用户要求补注释、调整注释、review 注释质量、沉淀注释规范，或代码涉及前后端通用逻辑、前端 React Hook / 事件处理器、Node.js 后台 controller / service / SQL / 任务编排时，使用这个 skill。目标是让注释解释关键意图，不给简单代码逐行配旁白。
---

# notes

这个 skill 用于写代码注释。注释要帮助后来读代码的人理解关键意图，而不是把代码翻译成中文。

## 注释决策流程

先判断这个位置是否真的需要注释，再决定写 JSDoc、行内注释，还是不写。这个流程能避免给简单代码配旁白。

```text
看到一个代码位置
        │
        ├─ 是导出函数或 class static 方法？
        │        └─ 写简短 JSDoc，说明业务用途、关键入参或返回含义
        │
        ├─ 是复杂判断、状态流转、SQL 口径、异步副作用或模型协议边界？
        │        └─ 写注释说明为什么这样做、避免什么误解
        │
        ├─ 是一组相似字段映射或模板取值？
        │        └─ 在这一组上方写一行总结，不逐字段解释
        │
        ├─ 前面有空行，表示进入新的业务小阶段？
        │        └─ 在这一段代码上方写一行组注释；如果说不出注释，就去掉空行
        │
        └─ 是简单赋值、普通取字段、明显空值回退或普通按钮点击？
                 └─ 不写注释
```

## 通用判断表

| 代码场景                                   | 推荐动作     | 注释重点                                       |
| ------------------------------------------ | ------------ | ---------------------------------------------- |
| 导出函数、class 的 static 方法             | 写 JSDoc     | 写业务用途、关键入参或返回结果的业务含义       |
| 复杂判断、连续判断、复杂三元、循环、switch | 写行内注释   | 写判断依据、状态优先级或分支边界               |
| 数字计算、聚合统计、字段口径转换           | 写行内注释   | 写计算口径、精度边界、最终展示含义             |
| 数据结构转换、模板拼接、prompt 边界        | 写行内注释   | 写转换后的读取方式、模型可见边界或用户可见效果 |
| 多行相似取值或字段映射                     | 写一行组注释 | 解释这一组数据的共同语义                       |
| 空行分隔出的业务小块                       | 写一行组注释 | 说明这一段代码在当前流程里的业务目标           |
| 简单赋值、普通取字段、明显空值回退         | 不写         | 代码本身已经能表达，不要制造噪音               |
| “获取某某”“设置某某”“返回某某”“处理某某”   | 不写         | 这类注释只复述代码表面行为                     |

## 前后端通用注释

注释只写在值得解释的地方。它应该说明为什么这样写、避免什么误解、字段代表什么业务含义。简单赋值、普通取字段、明显的空值回退、一眼能看懂的单条件判断，不要单独写注释。

多行相似取值如果需要说明，优先在这一组代码上方写一行总结注释，不要每一行都配一句旁白。空行只用于分隔不同业务阶段、不同控制流或确实需要停顿的说明。只要保留空行，空行后面的代码块上方就要有一行组注释说明这一小块在做什么；如果这一段简单到写不出有意义的组注释，就去掉空行，让代码连续读下去。

导出函数、class 的 static 方法，必须在定义上方写简短 JSDoc，说明方法自身职责、关键入参或返回结果的业务含义。不要写只复述函数名的 JSDoc，也不要把通用方法绑定到某个当前调用方场景。

复杂判断、连续判断、复杂三元表达式、循环、switch、数字计算、字段语义、数据结构转换、展示文案拼接、输出模板和 prompt 边界，才是优先补注释的地方。注释要讲判断依据、计算口径、转换后的读取方式、最终用户可见效果或模型可见边界。

不要写“获取某某”“设置某某”“返回某某”“处理某某”这种表面注释。不要把十几个字段取值逐行解释。不要写长段落，一条注释只讲一个重点。

### 前后端通用示例

```ts
// 这些字段只是把已有统计结果塞进模板，保持一组注释即可。
const questionActivityCount = output.question?.activityCount ?? "计算中";
const discussionActivityCount = output.discussion?.activityCount ?? "计算中";

const attendanceRateNumber = Number(evaluation.attendanceRate);
const attendanceRateAverageNumber = Number(evaluation.attendanceRateAverage);
// 两个值都是真正的数字时才计算差值，否则保留原始展示文本，避免输出 NaN。
if (Number.isFinite(attendanceRateNumber) && Number.isFinite(attendanceRateAverageNumber)) {
  const attendanceRateComparison = attendanceRateNumber >= attendanceRateAverageNumber ? "高出" : "低于";
}

// 有姓名时拼成 学生A、学生B、学生C 这种展示形式，不展示内部 studentId。
const quickAnswerTopStudentText = `${quickAnswerTopStudentNames.join("、")}同学互动积极`;
```

## 前端 React 注释

React 组件里的 `useEffect`、`useMemo`、`useCallback` 和事件处理函数，只有在承载外部订阅、定时器、防抖 / 节流、异步请求、DOM 或滚动副作用、本地输入态与父级状态解耦等不直观意图时才补注释。

| React 位置                    | 什么时候写                                     | 写什么                             |
| ----------------------------- | ---------------------------------------------- | ---------------------------------- |
| `useEffect`                   | 有订阅、定时器、异步请求、DOM 副作用或 cleanup | 副作用边界、cleanup 原因、依赖意图 |
| `useMemo` / `useCallback`     | 缓存承载业务语义，或依赖选择容易误解           | 为什么缓存、依赖为什么这样取       |
| 事件处理函数                  | 交互被拆成立即 UI 更新和延迟副作用             | 用户动作如何进入状态、请求或防抖流 |
| 渲染分支                      | 空态、加载态、回放态、浮窗、全屏态有优先级     | 展示顺序和互斥关系                 |
| 普通 JSX、className、按钮点击 | 不写                                           | 结构本身已经直观                   |

`useEffect` 的注释写在 hook 上方，说明副作用边界、cleanup 原因和依赖意图。不要写“监听某某变化”这种表面注释。

事件处理函数的注释写在函数上方，说明用户交互如何被拆成立即 UI 更新和延迟副作用，或为什么不直接调用父级回调。不要写“处理某某输入”。

渲染分支、空态、加载态、回放态、浮窗 / 全屏态这类 UI 状态互斥时，如果优先级容易看错，要在分支上方说明展示顺序。普通 JSX 结构、显而易见的 className 和按钮点击，不要补注释。

### 前端 React 示例

```tsx
// RxJS 只订阅搜索输入流，组件卸载时主动释放订阅，避免切换入口后残留搜索回调。
useEffect(() => {
  const subscription = searchSubjectRef.current
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((value) => onChangeSearchKeyword(value));

  return () => {
    subscription.unsubscribe();
  };
}, [onChangeSearchKeyword]);

// 本地输入值先立即更新，原始关键词再进入防抖流，避免每次敲字都刷新列表。
const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;

  setSearchInput(value);
  searchSubjectRef.current.next(value);
};
```

## Node.js 后台注释

Node.js 后台的注释重点是业务边界、数据一致性和副作用。controller 注释说明请求参数、权限、租户、角色和提前返回的业务原因。service 注释说明编排顺序、事务边界、幂等设计、重试策略、缓存失效、软删除、状态流转和副作用顺序。

| 后台位置                                | 优先解释                                                    | 不要解释                  |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| controller                              | 权限、租户、角色、提前返回的业务原因                        | 普通取 query/body 参数    |
| service 编排                            | 顺序依赖、事务边界、幂等、重试、缓存失效、软删除            | 简单透传调用              |
| SQL / Kysely                            | join 关系、group by 口径、时间范围、状态过滤、业务 key 映射 | 普通 where 条件逐句解释   |
| 定时任务 / 队列                         | 重入、去重、失败处理、补偿策略                              | “开始执行任务”“捕获异常”  |
| 外部接口 / webhook / 文件 / 支付 / 推送 | 字段映射、外部副作用、失败后的可恢复边界                    | 每个 try/catch 的表面含义 |

数据库查询、SQL、ORM query builder、聚合统计要给不直观的 join 关系、group by 口径、时间范围、状态过滤和业务 key 映射补注释。不要给普通 where 条件逐句解释。

通用 db / service 方法的 JSDoc 只写方法自身的查询范围、过滤条件和返回含义。不要写“供某某模板使用”“给某某页面使用”这类调用方场景，因为调用方会变化，这种注释会把通用能力绑死到某个业务入口。

```ts
/** 查询课堂下已关闭且未删除的签到记录。 */
static async dbGetClosedSignsByCourseId(courseId: number) {
  // ...
}
```

定时任务、队列消费、消息订阅、外部接口、webhook、文件上传、支付、消息推送，要说明重入、去重、失败处理、字段映射和补偿策略。错误处理和日志只写决策原因，不要给每个 `try/catch` 写“捕获异常”。

### Node.js 后台示例

```ts
/** 刷新课程答题统计，并返回本次任务产出的课程维度汇总。 */
export async function refreshCourseAnswerStats(courseId: number) {
  const course = await findCourseById(courseId);

  // 历史任务可能残留已删除课程，跳过脏数据即可，避免整批统计刷新被单条记录中断。
  if (!course) return emptyCourseAnswerStats;

  return database.transaction(async (transaction) => {
    // 同一个后台任务允许失败后重试，先清理本轮临时明细再写入，保证重复执行不会累计旧数据。
    await deleteTemporaryAnswerStats(courseId, transaction);
    await insertTemporaryAnswerStats(courseId, transaction);

    // 汇总结果只在事务末尾落库，避免接口读到明细已更新但汇总未更新的中间态。
    return updateCourseAnswerSummary(courseId, transaction);
  });
}
```
