// column names declared here are case sensitive but queries in postgresql are not case sensitive. declare all tables and columns lowercase
// https://lerner.co.il/2013/11/30/quoting-postgresql/

export const up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    username: { type: "varchar(20)", notNull: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    password: {
      type: "varchar",
      notNull: true,
    },
  });

  pgm.createTable("posts", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    title: { type: "text", notNull: true },
    body: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    media: "text",
  });

  pgm.createTable("comments", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    post_id: {
      type: "integer",
      // notNull: true, uncomment this in next DB wipe/migration
      references: '"posts"',
      onDelete: "CASCADE",
    },
    parent_comment_id: {
      type: "integer",
      references: '"comments"',
      onDelete: "CASCADE",
    },
    body: {
      type: "text",
      // notNull: true, uncomment this in next DB wipe/migration
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    media: "text",
  });

  pgm.createTable("votes", {
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    post_id: {
      type: "integer",
      references: '"posts"',
      onDelete: "CASCADE",
    },
    comment_id: {
      type: "integer",
      references: '"comments"',
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    vote: {
      type: "integer",
    },
  });

  pgm.addConstraint("votes", "chk_votes_valid_target", {
    check: `
      (post_id IS NOT NULL AND comment_id IS NULL)
      OR
      (post_id IS NULL AND comment_id IS NOT NULL)
    `,
  });

  pgm.addConstraint("votes", "unique_post_vote", {
    unique: ["user_id", "post_id"],
  });

  pgm.addConstraint("votes", "unique_comment_vote", {
    unique: ["user_id", "comment_id"],
  });

  pgm.createTable("tags", {
    post_id: {
      type: "integer",
      references: '"posts"',
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    tag: { type: "varchar(180)", notNull: true },
  });
};
