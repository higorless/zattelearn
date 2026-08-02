export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface Subject {
  id: number
  name: string
  description: string | null
  color: string
  createdAt: string
}

export interface Topic {
  id: number
  subjectId: number
  name: string
  description: string | null
  createdAt: string
}

export interface Objective {
  id: number
  subjectId: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'done'
  dueDate: string | null
  createdAt: string
}

export interface KanbanColumn {
  id: number
  title: string
  position: number
  cards: KanbanCard[]
  createdAt: string
}

export interface KanbanCard {
  id: number
  columnId: number
  subjectId: number | null
  topicId: number | null
  objectiveId: number | null
  title: string
  description: string | null
  position: number
  scheduledFor: string | null
  subject?: Subject
  topic?: Topic
  objective?: Pick<Objective, 'id' | 'title' | 'status'>
  createdAt: string
}

export interface StudySession {
  id: number
  cardId: number
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
  comments: SessionComment[]
  createdAt: string
}

export interface SessionComment {
  id: number
  sessionId: number
  content: string
  createdAt: string
}

export interface ZettelNote {
  id: number
  sessionId: number | null
  title: string
  content: string
  tags: string[]
  links: ZettelLink[]
  createdAt: string
}

export interface ZettelLink {
  id: number
  fromNoteId: number
  toNoteId: number
  relationshipType: string
  createdAt: string
}

export interface Goal {
  id: number
  subjectId: number
  topicId: number | null
  title: string
  targetHours: number
  deadline: string | null
  createdAt: string
  // computed by backend
  studiedSeconds: number
  subjectName: string
  subjectColor: string
  topicName: string | null
}
