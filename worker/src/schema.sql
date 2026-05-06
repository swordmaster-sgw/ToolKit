-- 工具使用埋点表
CREATE TABLE IF NOT EXISTS track (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 埋点索引：按工具+日期查询
CREATE INDEX IF NOT EXISTS idx_track_tool_date ON track(tool_id, created_at);

-- 埋点索引：按 session 去重
CREATE INDEX IF NOT EXISTS idx_track_session ON track(tool_id, session_id, date(created_at));

-- 反馈表
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'suggestion',
  tool_id TEXT,
  tool_name TEXT,
  content TEXT NOT NULL,
  contact TEXT,
  ip TEXT,
  github_issue_url TEXT,
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 反馈索引
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
