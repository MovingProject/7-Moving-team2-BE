-- CreateIndex
CREATE INDEX "Request_pending_lookup" ON "public"."Request"("consumerId", "requestStatus", "createdAt" DESC);
