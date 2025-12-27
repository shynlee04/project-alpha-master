# **7. i18n Implementation**

### **7.1 Translation Structure**

```json
// locales/en/common.json
{
  "nav": {
    "projects": "Projects",
    "ide": "IDE",
    "agents": "Agents",
    "settings": "Settings"
  },
  "agents": {
    "status": {
      "active": "Active",
      "paused": "Paused",
      "error": "Error",
      "idle": "Idle"
    },
    "actions": {
      "configure": "Configure",
      "pause": "Pause",
      "resume": "Resume",
      "delete": "Delete"
    }
  }
}

// locales/vi/common.json
{
  "nav": {
    "projects": "Dự án",
    "ide": "IDE",
    "agents": "Đại lý AI",
    "settings": "Cài đặt"
  },
  "agents": {
    "status": {
      "active": "Đang hoạt động",
      "paused": "Tạm dừng",
      "error": "Lỗi",
      "idle": "Rảnh rỗi"
    }
  }
}
```

***

### **7.2 Usage in Components**

```typescript
import { useTranslation } from 'react-i18next';

function AgentCard({ agent }: AgentCardProps) {
  const { t } = useTranslation('common');
  
  return (
    <Card>
      <CardHeader>
        <h3>{agent.name}</h3>
        <Badge>{t(`agents.status.${agent.status}`)}</Badge>
      </CardHeader>
      <CardFooter>
        <Button>{t('agents.actions.configure')}</Button>
        <Button>{t('agents.actions.pause')}</Button>
      </CardFooter>
    </Card>
  );
}
```

***
