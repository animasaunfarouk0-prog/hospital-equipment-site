-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'HOSPITAL_STAFF');

-- CreateEnum
CREATE TYPE "availability_status" AS ENUM ('AVAILABLE', 'LIMITED', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(300) NOT NULL,
    "state" VARCHAR(60) NOT NULL,
    "lga" VARCHAR(100),
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "phone" VARCHAR(30),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'HOSPITAL_STAFF',
    "hospital_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(100),

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" SERIAL NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "status" "availability_status" NOT NULL DEFAULT 'AVAILABLE',
    "quantity" INTEGER,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hospitals_state_idx" ON "hospitals"("state");

-- CreateIndex
CREATE INDEX "hospitals_lat_lng_idx" ON "hospitals"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_hospital_id_idx" ON "users"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_name_key" ON "equipment"("name");

-- CreateIndex
CREATE INDEX "availability_equipment_id_status_idx" ON "availability"("equipment_id", "status");

-- CreateIndex
CREATE INDEX "availability_updated_at_idx" ON "availability"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "availability_hospital_id_equipment_id_key" ON "availability"("hospital_id", "equipment_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
