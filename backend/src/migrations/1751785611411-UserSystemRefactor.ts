import { MigrationInterface, QueryRunner } from "typeorm";

export class UserSystemRefactor1751785611411 implements MigrationInterface {
    name = 'UserSystemRefactor1751785611411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."auth_methods_auth_type_enum" AS ENUM('web3', 'google', 'github')`);
        await queryRunner.query(`CREATE TABLE "auth_methods" ("auth_id" SERIAL NOT NULL, "user_id" integer NOT NULL, "auth_type" "public"."auth_methods_auth_type_enum" NOT NULL, "auth_identifier" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_63a61fa59c69f34c9734ec13bf2" UNIQUE ("auth_type", "auth_identifier"), CONSTRAINT "PK_719d8a84a38d7e39bd1f589c9ab" PRIMARY KEY ("auth_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'developer')`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "reward_address" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "auth_methods" ADD CONSTRAINT "FK_b8674f88fd00217ae9619f6c3e9" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_methods" DROP CONSTRAINT "FK_b8674f88fd00217ae9619f6c3e9"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "auth_methods"`);
        await queryRunner.query(`DROP TYPE "public"."auth_methods_auth_type_enum"`);
    }

}
