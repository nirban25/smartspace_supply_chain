using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pgcrypto", ",,");

            migrationBuilder.CreateTable(
                name: "alert_categories",
                schema: "public",
                columns: table => new
                {
                    category = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alert_categories", x => x.category);
                });

            migrationBuilder.CreateTable(
                name: "alert_severities",
                schema: "public",
                columns: table => new
                {
                    severity = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alert_severities", x => x.severity);
                });

            migrationBuilder.CreateTable(
                name: "audit_events",
                schema: "public",
                columns: table => new
                {
                    audit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    entity_type = table.Column<string>(type: "text", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    details = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_events", x => x.audit_id);
                });

            migrationBuilder.CreateTable(
                name: "daily_plans",
                schema: "public",
                columns: table => new
                {
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    plan_date = table.Column<DateOnly>(type: "date", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("daily_plans_pkey", x => x.plan_id);
                });

            migrationBuilder.CreateTable(
                name: "materials",
                schema: "public",
                columns: table => new
                {
                    material_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    code = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    hazardous = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("materials_pkey", x => x.material_id);
                });

            migrationBuilder.CreateTable(
                name: "mv_daily_receipts",
                schema: "public",
                columns: table => new
                {
                    node_id = table.Column<Guid>(type: "uuid", nullable: true),
                    receipt_date = table.Column<DateOnly>(type: "date", nullable: true),
                    arrivals = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "node_types",
                schema: "public",
                columns: table => new
                {
                    node_type = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_node_types", x => x.node_type);
                });

            migrationBuilder.CreateTable(
                name: "railcars",
                schema: "public",
                columns: table => new
                {
                    railcar_id = table.Column<string>(type: "text", nullable: false),
                    check_digit = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("railcars_pkey", x => x.railcar_id);
                });

            migrationBuilder.CreateTable(
                name: "staging_emails",
                schema: "public",
                columns: table => new
                {
                    mail_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    received_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sender = table.Column<string>(type: "text", nullable: true),
                    source_label = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staging_emails", x => x.mail_id);
                });

            migrationBuilder.CreateTable(
                name: "suppliers",
                schema: "public",
                columns: table => new
                {
                    supplier_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_suppliers", x => x.supplier_id);
                });

            migrationBuilder.CreateTable(
                name: "system_parameters",
                schema: "public",
                columns: table => new
                {
                    param_key = table.Column<string>(type: "text", nullable: false),
                    param_value = table.Column<string>(type: "text", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_parameters", x => x.param_key);
                });

            migrationBuilder.CreateTable(
                name: "material_design_limits",
                schema: "public",
                columns: table => new
                {
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_units = table.Column<int>(type: "integer", nullable: false),
                    safety_stock = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_material_design_limits", x => x.material_id);
                    table.ForeignKey(
                        name: "FK_material_design_limits_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "nodes",
                schema: "public",
                columns: table => new
                {
                    node_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "text", nullable: false),
                    node_type = table.Column<string>(type: "text", nullable: false),
                    design_capacity = table.Column<int>(type: "integer", nullable: true),
                    tz = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("nodes_pkey", x => x.node_id);
                    table.ForeignKey(
                        name: "FK_nodes_node_types_node_type",
                        column: x => x.node_type,
                        principalSchema: "public",
                        principalTable: "node_types",
                        principalColumn: "node_type",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "empty_car_releases",
                schema: "public",
                columns: table => new
                {
                    release_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    railcar_id = table.Column<string>(type: "text", nullable: false),
                    released_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    portal_txn_id = table.Column<string>(type: "text", nullable: true),
                    source_ref = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("empty_car_releases_pkey", x => x.release_id);
                    table.ForeignKey(
                        name: "FK_empty_car_releases_railcars_railcar_id",
                        column: x => x.railcar_id,
                        principalSchema: "public",
                        principalTable: "railcars",
                        principalColumn: "railcar_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "staging_attachments",
                schema: "public",
                columns: table => new
                {
                    attachment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mail_id = table.Column<Guid>(type: "uuid", nullable: false),
                    filename = table.Column<string>(type: "text", nullable: false),
                    content_type = table.Column<string>(type: "text", nullable: true),
                    stored_path = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staging_attachments", x => x.attachment_id);
                    table.ForeignKey(
                        name: "FK_staging_attachments_staging_emails_mail_id",
                        column: x => x.mail_id,
                        principalSchema: "public",
                        principalTable: "staging_emails",
                        principalColumn: "mail_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "alerts",
                schema: "public",
                columns: table => new
                {
                    alert_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    category = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    node_id = table.Column<Guid>(type: "uuid", nullable: true),
                    material_id = table.Column<Guid>(type: "uuid", nullable: true),
                    message = table.Column<string>(type: "text", nullable: false),
                    raised_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    cleared_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("alerts_pkey", x => x.alert_id);
                    table.ForeignKey(
                        name: "FK_alerts_alert_categories_category",
                        column: x => x.category,
                        principalSchema: "public",
                        principalTable: "alert_categories",
                        principalColumn: "category",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_alerts_alert_severities_severity",
                        column: x => x.severity,
                        principalSchema: "public",
                        principalTable: "alert_severities",
                        principalColumn: "severity",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_alerts_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id");
                    table.ForeignKey(
                        name: "FK_alerts_nodes_node_id",
                        column: x => x.node_id,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id");
                });

            migrationBuilder.CreateTable(
                name: "inventory_snapshots",
                schema: "public",
                columns: table => new
                {
                    snapshot_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    node_id = table.Column<Guid>(type: "uuid", nullable: false),
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    as_of = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("inventory_snapshots_pkey", x => x.snapshot_id);
                    table.ForeignKey(
                        name: "FK_inventory_snapshots_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inventory_snapshots_nodes_node_id",
                        column: x => x.node_id,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "operations",
                schema: "public",
                columns: table => new
                {
                    operation_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    plant_node_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    max_daily_unloads = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("operations_pkey", x => x.operation_id);
                    table.ForeignKey(
                        name: "FK_operations_nodes_plant_node_id",
                        column: x => x.plant_node_id,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "plan_unloads",
                columns: table => new
                {
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    node_id = table.Column<Guid>(type: "uuid", nullable: false),
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_units = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("plan_unloads_pkey", x => new { x.plan_id, x.node_id, x.material_id });
                    table.ForeignKey(
                        name: "FK_plan_unloads_daily_plans_plan_id",
                        column: x => x.plan_id,
                        principalSchema: "public",
                        principalTable: "daily_plans",
                        principalColumn: "plan_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_plan_unloads_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_plan_unloads_nodes_node_id",
                        column: x => x.node_id,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "railcar_movements",
                schema: "public",
                columns: table => new
                {
                    movement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    railcar_id = table.Column<string>(type: "text", nullable: false),
                    from_node = table.Column<Guid>(type: "uuid", nullable: true),
                    to_node = table.Column<Guid>(type: "uuid", nullable: false),
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    source_ref = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_railcar_movements", x => x.movement_id);
                    table.ForeignKey(
                        name: "FK_railcar_movements_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_railcar_movements_nodes_from_node",
                        column: x => x.from_node,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id");
                    table.ForeignKey(
                        name: "FK_railcar_movements_nodes_to_node",
                        column: x => x.to_node,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_railcar_movements_railcars_railcar_id",
                        column: x => x.railcar_id,
                        principalSchema: "public",
                        principalTable: "railcars",
                        principalColumn: "railcar_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "silos",
                schema: "public",
                columns: table => new
                {
                    silo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plant_node_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    max_units = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_silos", x => x.silo_id);
                    table.ForeignKey(
                        name: "FK_silos_nodes_plant_node_id",
                        column: x => x.plant_node_id,
                        principalSchema: "public",
                        principalTable: "nodes",
                        principalColumn: "node_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "staging_rows",
                schema: "public",
                columns: table => new
                {
                    row_id = table.Column<Guid>(type: "uuid", nullable: false),
                    attachment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    key = table.Column<string>(type: "text", nullable: true),
                    value = table.Column<string>(type: "text", nullable: true),
                    parsed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staging_rows", x => x.row_id);
                    table.ForeignKey(
                        name: "FK_staging_rows_staging_attachments_attachment_id",
                        column: x => x.attachment_id,
                        principalSchema: "public",
                        principalTable: "staging_attachments",
                        principalColumn: "attachment_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "unloading_events",
                schema: "public",
                columns: table => new
                {
                    unload_id = table.Column<Guid>(type: "uuid", nullable: false),
                    operation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    railcar_id = table.Column<string>(type: "text", nullable: false),
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    unloaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    source_ref = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_unloading_events", x => x.unload_id);
                    table.ForeignKey(
                        name: "FK_unloading_events_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_unloading_events_operations_operation_id",
                        column: x => x.operation_id,
                        principalSchema: "public",
                        principalTable: "operations",
                        principalColumn: "operation_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_unloading_events_railcars_railcar_id",
                        column: x => x.railcar_id,
                        principalSchema: "public",
                        principalTable: "railcars",
                        principalColumn: "railcar_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "silo_material_capacity",
                columns: table => new
                {
                    silo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    max_units = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_silo_material_capacity", x => new { x.silo_id, x.material_id });
                    table.ForeignKey(
                        name: "FK_silo_material_capacity_materials_material_id",
                        column: x => x.material_id,
                        principalSchema: "public",
                        principalTable: "materials",
                        principalColumn: "material_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_silo_material_capacity_silos_silo_id",
                        column: x => x.silo_id,
                        principalSchema: "public",
                        principalTable: "silos",
                        principalColumn: "silo_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_alerts_material_id",
                schema: "public",
                table: "alerts",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "IX_alerts_node_id",
                schema: "public",
                table: "alerts",
                column: "node_id");

            migrationBuilder.CreateIndex(
                name: "IX_alerts_severity",
                schema: "public",
                table: "alerts",
                column: "severity");

            migrationBuilder.CreateIndex(
                name: "uq_alert_instance",
                schema: "public",
                table: "alerts",
                columns: new[] { "category", "node_id", "material_id", "raised_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_plan_version",
                schema: "public",
                table: "daily_plans",
                columns: new[] { "plan_date", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_empty_car_releases_railcar_id",
                schema: "public",
                table: "empty_car_releases",
                column: "railcar_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_snapshots_material_id",
                schema: "public",
                table: "inventory_snapshots",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "uq_inventory",
                schema: "public",
                table: "inventory_snapshots",
                columns: new[] { "node_id", "material_id", "as_of" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "materials_code_key",
                schema: "public",
                table: "materials",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_nodes_node_type",
                schema: "public",
                table: "nodes",
                column: "node_type");

            migrationBuilder.CreateIndex(
                name: "nodes_name_key",
                schema: "public",
                table: "nodes",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_operations_plant_node_id",
                schema: "public",
                table: "operations",
                column: "plant_node_id");

            migrationBuilder.CreateIndex(
                name: "IX_plan_unloads_material_id",
                table: "plan_unloads",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "IX_plan_unloads_node_id",
                table: "plan_unloads",
                column: "node_id");

            migrationBuilder.CreateIndex(
                name: "IX_railcar_movements_from_node",
                schema: "public",
                table: "railcar_movements",
                column: "from_node");

            migrationBuilder.CreateIndex(
                name: "IX_railcar_movements_material_id",
                schema: "public",
                table: "railcar_movements",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "IX_railcar_movements_to_node",
                schema: "public",
                table: "railcar_movements",
                column: "to_node");

            migrationBuilder.CreateIndex(
                name: "uq_movement",
                schema: "public",
                table: "railcar_movements",
                columns: new[] { "railcar_id", "to_node", "event_time" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_silo_material_capacity_material_id",
                table: "silo_material_capacity",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "silos_plant_node_id_name_key",
                schema: "public",
                table: "silos",
                columns: new[] { "plant_node_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_staging_attachments_mail_id",
                schema: "public",
                table: "staging_attachments",
                column: "mail_id");

            migrationBuilder.CreateIndex(
                name: "IX_staging_rows_attachment_id",
                schema: "public",
                table: "staging_rows",
                column: "attachment_id");

            migrationBuilder.CreateIndex(
                name: "suppliers_name_key",
                schema: "public",
                table: "suppliers",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_unloading_events_material_id",
                schema: "public",
                table: "unloading_events",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "IX_unloading_events_operation_id",
                schema: "public",
                table: "unloading_events",
                column: "operation_id");

            migrationBuilder.CreateIndex(
                name: "IX_unloading_events_railcar_id",
                schema: "public",
                table: "unloading_events",
                column: "railcar_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "alerts",
                schema: "public");

            migrationBuilder.DropTable(
                name: "audit_events",
                schema: "public");

            migrationBuilder.DropTable(
                name: "empty_car_releases",
                schema: "public");

            migrationBuilder.DropTable(
                name: "inventory_snapshots",
                schema: "public");

            migrationBuilder.DropTable(
                name: "material_design_limits",
                schema: "public");

            migrationBuilder.DropTable(
                name: "mv_daily_receipts",
                schema: "public");

            migrationBuilder.DropTable(
                name: "plan_unloads");

            migrationBuilder.DropTable(
                name: "railcar_movements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "silo_material_capacity");

            migrationBuilder.DropTable(
                name: "staging_rows",
                schema: "public");

            migrationBuilder.DropTable(
                name: "suppliers",
                schema: "public");

            migrationBuilder.DropTable(
                name: "system_parameters",
                schema: "public");

            migrationBuilder.DropTable(
                name: "unloading_events",
                schema: "public");

            migrationBuilder.DropTable(
                name: "alert_categories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "alert_severities",
                schema: "public");

            migrationBuilder.DropTable(
                name: "daily_plans",
                schema: "public");

            migrationBuilder.DropTable(
                name: "silos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "staging_attachments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "materials",
                schema: "public");

            migrationBuilder.DropTable(
                name: "operations",
                schema: "public");

            migrationBuilder.DropTable(
                name: "railcars",
                schema: "public");

            migrationBuilder.DropTable(
                name: "staging_emails",
                schema: "public");

            migrationBuilder.DropTable(
                name: "nodes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "node_types",
                schema: "public");
        }
    }
}
