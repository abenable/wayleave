-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "transmission_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "voltage" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "length_km" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transmission_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wayleave_buffers" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "buffer_radius" INTEGER NOT NULL,
    "geometry" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wayleave_buffers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detections" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "date_detected" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "distance_to_centerline" TEXT NOT NULL,
    "chainage" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "transmission_line_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "detections_line_id_idx" ON "detections"("line_id");

-- CreateIndex
CREATE INDEX "detections_type_idx" ON "detections"("type");

-- CreateIndex
CREATE INDEX "detections_severity_idx" ON "detections"("severity");

-- CreateIndex
CREATE INDEX "detections_status_idx" ON "detections"("status");

-- CreateIndex
CREATE INDEX "detections_date_detected_idx" ON "detections"("date_detected");

-- AddForeignKey
ALTER TABLE "wayleave_buffers" ADD CONSTRAINT "wayleave_buffers_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "transmission_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detections" ADD CONSTRAINT "detections_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "transmission_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

