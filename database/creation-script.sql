CREATE TABLE public.instruments (
	id serial4 NOT NULL,
	ticker varchar(10) NULL,
	"name" varchar(255) NULL,
	"type" varchar(10) NULL,
	CONSTRAINT instruments_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_instruments_name ON public.instruments USING btree (name);
CREATE INDEX idx_instruments_ticker ON public.instruments USING btree (ticker);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id serial4 NOT NULL,
	email varchar(255) NULL,
	accountnumber varchar(20) NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_users_accountnumber ON public.users USING btree (accountnumber);
CREATE INDEX idx_users_email ON public.users USING btree (email);


-- public.marketdata definition

-- Drop table

-- DROP TABLE public.marketdata;

CREATE TABLE public.marketdata (
	id serial4 NOT NULL,
	instrumentid int4 NULL,
	high numeric(10, 2) NULL,
	low numeric(10, 2) NULL,
	"open" numeric(10, 2) NULL,
	"close" numeric(10, 2) NULL,
	previousclose numeric(10, 2) NULL,
	"date" date NULL,
	CONSTRAINT marketdata_pkey PRIMARY KEY (id),
	CONSTRAINT marketdata_instrumentid_fkey FOREIGN KEY (instrumentid) REFERENCES public.instruments(id)
);
CREATE INDEX idx_marketdata_date ON public.marketdata USING btree (date);
CREATE INDEX idx_marketdata_instrumentid ON public.marketdata USING btree (instrumentid);


-- public.orders definition

-- Drop table

-- DROP TABLE public.orders;

CREATE TABLE public.orders (
	id serial4 NOT NULL,
	instrumentid int4 NULL,
	userid int4 NULL,
	"size" int4 NULL,
	price numeric(10, 2) NULL,
	"type" varchar(10) NULL,
	side varchar(10) NULL,
	status varchar(20) NULL,
	datetime timestamp NULL,
	CONSTRAINT orders_pkey PRIMARY KEY (id),
	CONSTRAINT orders_instrumentid_fkey FOREIGN KEY (instrumentid) REFERENCES public.instruments(id),
	CONSTRAINT orders_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);
CREATE INDEX idx_orders_instrumentid ON public.orders USING btree (instrumentid);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_userid ON public.orders USING btree (userid);


-- public.positions definition

-- Drop table

-- DROP TABLE public.positions;

CREATE TABLE public.positions (
	id serial4 NOT NULL,
	userid int4 NULL,
	instrumentid int4 NULL,
	"size" int4 NULL,
	CONSTRAINT positions_pkey PRIMARY KEY (id),
	CONSTRAINT positions_instrumentid_fkey FOREIGN KEY (instrumentid) REFERENCES public.instruments(id),
	CONSTRAINT positions_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);
CREATE INDEX idx_positions_instrumentid ON public.positions USING btree (instrumentid);
CREATE INDEX idx_positions_userid ON public.positions USING btree (userid);