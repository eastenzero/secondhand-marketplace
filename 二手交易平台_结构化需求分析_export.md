**实验一 结构化需求分析——二手交易平台**

一、实验类型

二手交易平台

系统概述：面向个人用户的二手商品与需求信息撮合平台，支持游客注册、会员发布、搜索、报价、留言及个人信息管理，平台提供数据存储、审核、日志与故障恢复等支撑能力。

二、实验目的

1．掌握数据流的分析技术。

2．掌握软件需求分析的过程和方法。

3．熟悉项目开发计划和需求规格说明书的制定方法。

三、实验内容和要求

1．用结构化数据流分析技术进行软件系统需求分析，得出系统的数据流图和数据字典。

2．正确运用图表工具进行表示。

3．按规范正确编写软件文档。

四、实验步骤

1．理解业务流程与范围

- 游客浏览公开的商品简介，可提交注册申请成为会员，平台校验并反馈注册结果。
- 会员登录后可检索二手商品或求购信息，查看商品详情，发起报价、留言，与其他会员互动。
- 会员可发布新商品或需求信息，并对自身发布的商品、报价、留言等进行维护、下架或删除。
- 平台负责信息汇总、审核、存储、搜索与排序，并提供日志记录、数据备份与故障恢复。

2．系统问题定义和可行性分析

系统问题定义：

当前分散的二手信息缺乏统一发布与互动平台，会员难以高效搜索与匹配需求，沟通链路冗长且缺乏信用与记录支撑。目标系统需提供稳定、易用、安全的二手商品与求购撮合服务，实现从注册、信息发布、搜索、报价到信息管理的闭环。

可行性分析：

- 技术可行性：采用前后端分离架构与关系型数据库，配合检索、消息通知与日志组件，可实现所需功能与非功能性目标。
- 经济可行性：可在现有基础设施上部署，初期投入聚焦开发测试，运维成本可控，投入产出比合理。
- 运营可行性：角色划分清晰、流程直观，配合必要运营与审核策略可有效获取与留存用户；后台管理与审计支撑日常维护。

3．功能性需求分析

- 访客注册功能
  - 描述：游客向平台提交注册申请，平台校验并反馈注册结果，完成会员开通。
  - 主要数据流：游客→注册申请→平台；平台→注册反馈→游客；平台↔用户库（写/查重）。

- 会员搜索功能（商品/需求）
  - 描述：会员发送搜索请求，平台返回符合条件的商品或需求列表与摘要。
  - 主要数据流：会员→搜索请求（关键词、筛选条件）→平台；平台↔商品库/需求库（读）；平台→搜索结果→会员。

- 报价功能
  - 描述：会员对目标商品（或对需求）发起报价，平台校验并记录，向相关会员反馈报价信息。
  - 主要数据流：会员→报价请求→平台；平台↔报价库（写）；平台→报价反馈/通知→相关会员；平台↔商品库/需求库（读校验）。

- 商品信息查看功能
  - 描述：平台向会员提供商品详情、历史报价与留言概览。
  - 主要数据流：会员→详情请求→平台；平台↔商品库（读）；平台↔报价库/留言库（读）；平台→详情数据→会员。

- 发布功能（商品/需求）
  - 描述：会员提交发布请求，平台校验、可选审核并入库，向会员反馈发布结果。
  - 主要数据流：会员→发布请求→平台；平台↔商品库/需求库（写）；平台→发布反馈→会员；平台↔日志/审核记录（写）。

- 留言功能
  - 描述：围绕商品或需求发送留言，查看交流记录。
  - 主要数据流：会员→留言请求→平台；平台↔留言库（写/读）；平台→留言列表→会员。

- 信息管理功能（我的发布/报价/留言）
  - 描述：会员对自己发布的信息进行修改、下架、删除等维护；支持查看与撤回报价、删除留言等。
  - 主要数据流：会员→信息管理请求→平台；平台↔商品库/需求库/报价库/留言库（读写）；平台→操作结果→会员。

4．非功能性需求分析

- 性能需求：
  - P95 页面与接口响应时间在可接受范围（如≤2s）内；高并发下支持水平扩展；搜索、发布、报价等核心路径具备缓存与异步化策略。
- 可靠性需求：
  - 定期备份与异地容灾；出现硬件或软件故障时具备快速恢复能力；关键操作具备幂等与重试策略。
- 易用性需求：
  - 界面简洁直观，操作流程明确；提供清晰表单校验与错误提示及修复建议；可访问性与移动端适配。
- 安全性需求：
  - 注册/登录采用身份验证与会话管理；敏感数据传输与存储加密；权限与数据隔离；日志审计满足合规。
- 可维护性需求：
  - 模块化与清晰分层，代码可读性良好；完善日志与监控，便于排障与优化；自动化测试与持续集成支持快速迭代。

5．数据流图（DFD）

第0层数据流图（上下文图）：

![第0层DFD](images/dfd-0.png)

第1层数据流图（主要子过程与数据存储）：

![第1层DFD](images/dfd-1.png)

第2层数据流图（关键子过程细化示例）：

- 搜索与报价处理细化

![第2层-搜索与报价](images/dfd-2a.png)

- 商品与需求管理细化

![第2层-商品与需求](images/dfd-2b.png)

- 系统维护细化

![第2层-系统维护](images/dfd-2c.png)

6．数据字典（节选）

- 实体与存储

<table style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th style="border: 1px solid #000; padding: 4px;">名称</th>
      <th style="border: 1px solid #000; padding: 4px;">描述</th>
      <th style="border: 1px solid #000; padding: 4px;">关键数据项</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">用户库</td>
      <td style="border: 1px solid #000; padding: 4px;">存储会员账号与基础资料</td>
      <td style="border: 1px solid #000; padding: 4px;">user_id, username, password_hash, phone/email, status, created_at</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">商品库</td>
      <td style="border: 1px solid #000; padding: 4px;">存储二手商品信息</td>
      <td style="border: 1px solid #000; padding: 4px;">item_id, seller_id, title, desc, category, price, condition, images, status, created_at, updated_at</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">需求库</td>
      <td style="border: 1px solid #000; padding: 4px;">存储求购信息</td>
      <td style="border: 1px solid #000; padding: 4px;">demand_id, buyer_id, title, desc, category, expected_price, status, created_at</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">报价库</td>
      <td style="border: 1px solid #000; padding: 4px;">存储对商品/需求的报价</td>
      <td style="border: 1px solid #000; padding: 4px;">offer_id, target_type(item/demand), target_id, offerer_id, amount, message, status, created_at</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">留言库</td>
      <td style="border: 1px solid #000; padding: 4px;">存储留言记录</td>
      <td style="border: 1px solid #000; padding: 4px;">comment_id, target_type, target_id, user_id, content, created_at</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">日志/备份库</td>
      <td style="border: 1px solid #000; padding: 4px;">存储系统日志与备份元信息</td>
      <td style="border: 1px solid #000; padding: 4px;">log_id, level, message, ts / backup_id, snapshot_ref, ts</td>
    </tr>
  </tbody>
</table>

- 关键数据流与数据项

<table style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th style="border: 1px solid #000; padding: 4px;">数据流</th>
      <th style="border: 1px solid #000; padding: 4px;">来源→去向</th>
      <th style="border: 1px solid #000; padding: 4px;">主要数据项</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">注册申请</td>
      <td style="border: 1px solid #000; padding: 4px;">游客→注册管理</td>
      <td style="border: 1px solid #000; padding: 4px;">username, password, phone/email, captcha</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">注册反馈</td>
      <td style="border: 1px solid #000; padding: 4px;">注册管理→游客</td>
      <td style="border: 1px solid #000; padding: 4px;">result_code, message</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">搜索请求</td>
      <td style="border: 1px solid #000; padding: 4px;">会员→搜索与报价处理</td>
      <td style="border: 1px solid #000; padding: 4px;">keywords, filters(category, price_range, city), page, size</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">搜索结果</td>
      <td style="border: 1px solid #000; padding: 4px;">搜索与报价处理→会员</td>
      <td style="border: 1px solid #000; padding: 4px;">items[], total, page_info</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">报价请求</td>
      <td style="border: 1px solid #000; padding: 4px;">会员→搜索与报价处理</td>
      <td style="border: 1px solid #000; padding: 4px;">target_type, target_id, amount, remark</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">报价反馈/通知</td>
      <td style="border: 1px solid #000; padding: 4px;">搜索与报价处理→会员</td>
      <td style="border: 1px solid #000; padding: 4px;">result_code, message, offer_id</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">发布请求</td>
      <td style="border: 1px solid #000; padding: 4px;">会员→商品与需求管理</td>
      <td style="border: 1px solid #000; padding: 4px;">type(item/demand), title, desc, price/expected_price, images, contact</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">发布反馈</td>
      <td style="border: 1px solid #000; padding: 4px;">商品与需求管理→会员</td>
      <td style="border: 1px solid #000; padding: 4px;">result_code, message, id</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">留言请求</td>
      <td style="border: 1px solid #000; padding: 4px;">会员→留言管理</td>
      <td style="border: 1px solid #000; padding: 4px;">target_type, target_id, content</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">留言列表</td>
      <td style="border: 1px solid #000; padding: 4px;">留言管理→会员</td>
      <td style="border: 1px solid #000; padding: 4px;">comments[], page_info</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">信息管理请求</td>
      <td style="border: 1px solid #000; padding: 4px;">会员→各管理子过程</td>
      <td style="border: 1px solid #000; padding: 4px;">resource_type, action(update/withdraw/delete), payload</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 4px;">操作结果</td>
      <td style="border: 1px solid #000; padding: 4px;">各管理子过程→会员</td>
      <td style="border: 1px solid #000; padding: 4px;">result_code, message</td>
    </tr>
  </tbody>
</table>

五、总结

通过结构化需求分析，明确了二手交易平台的业务边界、核心功能与非功能性要求，形成了第0/1/2层数据流图与数据字典，为后续的详细设计、接口定义与实现提供依据与约束。

