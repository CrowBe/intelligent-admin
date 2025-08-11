-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "business_name" TEXT,
    "business_type" TEXT,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Sydney',
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "context_data" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "token_count" INTEGER,
    "processing_time_ms" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."integrations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT,
    "encrypted_tokens" TEXT NOT NULL,
    "refresh_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "scopes" TEXT NOT NULL,
    "capabilities" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'connected',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "last_sync_at" TIMESTAMP(3),
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "title" TEXT,
    "category" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "content_text" TEXT,
    "extracted_data" TEXT NOT NULL DEFAULT '{}',
    "processing_status" TEXT NOT NULL DEFAULT 'pending',
    "processing_error" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mcp_agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "endpoint" TEXT NOT NULL,
    "capabilities" TEXT NOT NULL DEFAULT '[]',
    "configuration" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" TEXT,
    "health_check_url" TEXT,
    "last_health_check" TIMESTAMP(3),
    "health_status" TEXT NOT NULL DEFAULT 'unknown',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mcp_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "agent_id" TEXT NOT NULL,
    "integration_id" TEXT,
    "task_type" TEXT NOT NULL,
    "input_payload" TEXT NOT NULL,
    "output_payload" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "processing_time_ms" INTEGER,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "preference_type" TEXT NOT NULL,
    "preference_data" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "learned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_applied_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_analyses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_message_id" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "urgency_score" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "business_impact" TEXT,
    "suggested_actions" TEXT NOT NULL DEFAULT '[]',
    "customer_type" TEXT,
    "job_value" DOUBLE PRECISION,
    "response_generated" BOOLEAN NOT NULL DEFAULT false,
    "user_feedback" TEXT,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."industry_knowledge" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_url" TEXT,
    "content_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extracted_data" TEXT NOT NULL DEFAULT '{}',
    "relevance_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "next_update_due" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "scheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_for" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "device_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_patterns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pattern_type" TEXT NOT NULL,
    "pattern_data" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "morning_brief_enabled" BOOLEAN NOT NULL DEFAULT true,
    "morning_brief_time" INTEGER NOT NULL DEFAULT 420,
    "urgent_emails_enabled" BOOLEAN NOT NULL DEFAULT true,
    "calendar_alerts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "weekend_notifications" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."onboarding_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "public"."chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chat_sessions_last_activity_at_idx" ON "public"."chat_sessions"("last_activity_at");

-- CreateIndex
CREATE INDEX "chat_sessions_status_idx" ON "public"."chat_sessions"("status");

-- CreateIndex
CREATE INDEX "messages_session_id_idx" ON "public"."messages"("session_id");

-- CreateIndex
CREATE INDEX "messages_timestamp_idx" ON "public"."messages"("timestamp");

-- CreateIndex
CREATE INDEX "messages_role_idx" ON "public"."messages"("role");

-- CreateIndex
CREATE INDEX "integrations_user_id_idx" ON "public"."integrations"("user_id");

-- CreateIndex
CREATE INDEX "integrations_provider_idx" ON "public"."integrations"("provider");

-- CreateIndex
CREATE INDEX "integrations_status_idx" ON "public"."integrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_user_id_provider_key" ON "public"."integrations"("user_id", "provider");

-- CreateIndex
CREATE INDEX "documents_user_id_idx" ON "public"."documents"("user_id");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "public"."documents"("category");

-- CreateIndex
CREATE INDEX "documents_processing_status_idx" ON "public"."documents"("processing_status");

-- CreateIndex
CREATE INDEX "documents_uploaded_at_idx" ON "public"."documents"("uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "mcp_agents_name_key" ON "public"."mcp_agents"("name");

-- CreateIndex
CREATE INDEX "mcp_agents_name_idx" ON "public"."mcp_agents"("name");

-- CreateIndex
CREATE INDEX "mcp_agents_status_idx" ON "public"."mcp_agents"("status");

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "public"."tasks"("user_id");

-- CreateIndex
CREATE INDEX "tasks_session_id_idx" ON "public"."tasks"("session_id");

-- CreateIndex
CREATE INDEX "tasks_agent_id_idx" ON "public"."tasks"("agent_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "public"."tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_started_at_idx" ON "public"."tasks"("started_at");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "public"."user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_preference_type_idx" ON "public"."user_preferences"("preference_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_preference_type_key" ON "public"."user_preferences"("user_id", "preference_type");

-- CreateIndex
CREATE INDEX "email_analyses_user_id_idx" ON "public"."email_analyses"("user_id");

-- CreateIndex
CREATE INDEX "email_analyses_category_idx" ON "public"."email_analyses"("category");

-- CreateIndex
CREATE INDEX "email_analyses_urgency_score_idx" ON "public"."email_analyses"("urgency_score");

-- CreateIndex
CREATE INDEX "email_analyses_analyzed_at_idx" ON "public"."email_analyses"("analyzed_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_analyses_user_id_email_message_id_key" ON "public"."email_analyses"("user_id", "email_message_id");

-- CreateIndex
CREATE INDEX "industry_knowledge_source_idx" ON "public"."industry_knowledge"("source");

-- CreateIndex
CREATE INDEX "industry_knowledge_content_type_idx" ON "public"."industry_knowledge"("content_type");

-- CreateIndex
CREATE INDEX "industry_knowledge_category_idx" ON "public"."industry_knowledge"("category");

-- CreateIndex
CREATE INDEX "industry_knowledge_relevance_score_idx" ON "public"."industry_knowledge"("relevance_score");

-- CreateIndex
CREATE INDEX "industry_knowledge_last_updated_idx" ON "public"."industry_knowledge"("last_updated");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "public"."notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_scheduled_for_idx" ON "public"."notifications"("scheduled_for");

-- CreateIndex
CREATE INDEX "notifications_sent_at_idx" ON "public"."notifications"("sent_at");

-- CreateIndex
CREATE INDEX "workflow_patterns_user_id_idx" ON "public"."workflow_patterns"("user_id");

-- CreateIndex
CREATE INDEX "workflow_patterns_pattern_type_idx" ON "public"."workflow_patterns"("pattern_type");

-- CreateIndex
CREATE INDEX "workflow_patterns_confidence_idx" ON "public"."workflow_patterns"("confidence");

-- CreateIndex
CREATE INDEX "workflow_patterns_last_seen_idx" ON "public"."workflow_patterns"("last_seen");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_patterns_user_id_pattern_type_key" ON "public"."workflow_patterns"("user_id", "pattern_type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "public"."notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_idx" ON "public"."notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_tokens_user_id_idx" ON "public"."notification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "notification_tokens_last_used_idx" ON "public"."notification_tokens"("last_used");

-- CreateIndex
CREATE UNIQUE INDEX "notification_tokens_user_id_token_key" ON "public"."notification_tokens"("user_id", "token");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_idx" ON "public"."notification_logs"("user_id");

-- CreateIndex
CREATE INDEX "notification_logs_type_idx" ON "public"."notification_logs"("type");

-- CreateIndex
CREATE INDEX "notification_logs_created_at_idx" ON "public"."notification_logs"("created_at");

-- CreateIndex
CREATE INDEX "onboarding_progress_user_id_idx" ON "public"."onboarding_progress"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_progress_step_idx" ON "public"."onboarding_progress"("step");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_user_id_step_key" ON "public"."onboarding_progress"("user_id", "step");

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."mcp_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_analyses" ADD CONSTRAINT "email_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_patterns" ADD CONSTRAINT "workflow_patterns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_tokens" ADD CONSTRAINT "notification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
