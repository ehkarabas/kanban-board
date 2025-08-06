--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.columns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    description text
);


ALTER TABLE public.columns OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    column_id uuid NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'todo'::text,
    assignee_id text,
    due_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.columns (id, title, "order", created_at, updated_at, deleted_at, description) FROM stdin;
3f65facd-bf39-4e3c-ad90-9b526843b076	In Progress	1	2025-07-30 14:40:04.180272	2025-07-30 14:40:04.180272	\N	\N
de35523c-a8aa-4ae7-bf6f-8b0c35393b49	Done	2	2025-07-30 14:40:04.180272	2025-07-30 14:40:04.180272	\N	\N
9e3cb61c-57c9-40b7-84a1-d3ed0702caed	Todo	0	2025-07-30 14:40:04.180272	2025-08-06 11:21:43.267	\N	
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, column_id, "order", priority, status, assignee_id, due_date, created_at, updated_at, deleted_at) FROM stdin;
f969bf0e-2a33-48b4-9a2c-bdb88bdec869	Set up authentication	Implement user login and registration	9e3cb61c-57c9-40b7-84a1-d3ed0702caed	1	medium	todo	2	\N	2025-07-30 14:40:04.198323	2025-07-30 14:40:04.198323	\N
c51638e3-1c41-497b-b0cc-6b3a537dbb1a	Deploy to production	Set up CI/CD pipeline	de35523c-a8aa-4ae7-bf6f-8b0c35393b49	0	high	done	4	\N	2025-07-30 14:40:04.198323	2025-07-30 14:40:04.198323	\N
9e52c9ba-4b69-4dbc-9cd3-a2a5ff091ea4	Review code quality	Audit codebase for performance improvements	9e3cb61c-57c9-40b7-84a1-d3ed0702caed	2	medium	todo	\N	\N	2025-07-30 14:40:04.198323	2025-07-30 14:40:04.198323	\N
94f5ee94-e254-4fe6-bf6d-ec6c514dd642	Design landing page	Create wireframes and mockups for the new landing page	9e3cb61c-57c9-40b7-84a1-d3ed0702caed	0	high	todo	1	\N	2025-07-30 14:40:04.198323	2025-08-05 10:55:27.505	\N
3773b9f8-3333-46cc-96f4-d487137eabb1	Database migration	Update user table schema	3f65facd-bf39-4e3c-ad90-9b526843b076	0	low	in_progress	3	\N	2025-07-30 14:40:04.198323	2025-08-06 14:49:28.717	\N
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: columns columns_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.columns
    ADD CONSTRAINT columns_new_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_new_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_column_id_columns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_column_id_columns_id_fk FOREIGN KEY (column_id) REFERENCES public.columns(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

