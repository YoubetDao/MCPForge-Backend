当你修改了实体（比如 user.entity.ts）后，你可以使用以下命令生成迁移：
```
npm run migration:generate -- src/migrations/[迁移名称]
```

运行迁移：
```
npm run migration:run

```

如果需要回滚最后一次迁移：
```
npm run migration:revert
```