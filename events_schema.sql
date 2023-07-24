--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Debian 15.1-1.pgdg110+1)
-- Dumped by pg_dump version 15.1

-- Started on 2023-07-24 17:39:44 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 3345 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 36558)
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    "userId" bigint NOT NULL,
    roles character varying(150),
    token character varying(50) DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 31367)
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    "eventId" uuid NOT NULL,
    "registrationsLimit" bigint NOT NULL,
    "isActive" boolean,
    title character varying(50)
);


--
-- TOC entry 216 (class 1259 OID 32079)
-- Name: log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "logTime" timestamp with time zone DEFAULT now() NOT NULL,
    content text NOT NULL,
    type character varying(30) NOT NULL,
    "requestId" uuid NOT NULL
);


--
-- TOC entry 214 (class 1259 OID 31155)
-- Name: requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requests (
    "eventId" uuid NOT NULL,
    "requestId" uuid NOT NULL,
    "userId" character varying(30) NOT NULL,
    name character varying(100) NOT NULL,
    status character varying(50) NOT NULL,
    "professionalSphere" character varying(100) NOT NULL,
    "professionalLevel" character varying(150) NOT NULL,
    confidence character varying(150) NOT NULL,
    "requestCode" character(6) NOT NULL,
    "telegramUserName" character varying(200)
);


--
-- TOC entry 3197 (class 2606 OID 36562)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY ("userId");


--
-- TOC entry 3193 (class 2606 OID 31371)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY ("eventId");


--
-- TOC entry 3195 (class 2606 OID 32087)
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- TOC entry 3191 (class 2606 OID 31159)
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY ("requestId");


-- Completed on 2023-07-24 17:39:44 UTC

--
-- PostgreSQL database dump complete
--

