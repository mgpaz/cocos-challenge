# Cocos API Challenge

Este es un proyecto de una API para gestionar órdenes de compra y venta de activos financieros, con funcionalidades como la obtención de portfolios, búsqueda de activos, y envío de órdenes al mercado. La API también maneja la validación de órdenes por monto, cancelación de órdenes, y actualización de posiciones.

## Tecnologías Utilizadas

- **NestJS**: Framework para crear aplicaciones de servidor en Node.js.
- **TypeORM**: ORM para trabajar con bases de datos SQL.
- **PostgreSQL**: Sistema de gestión de bases de datos.
- **Jest**: Framework de pruebas para Node.js.
- **Swagger**: Documentación interactiva de la API.


## Cambios en la Base de Datos

### 1. Agregado del index en las tablas de Order e Instrument
Se han añadido índices en las tablas orders y instruments para mejorar la eficiencia de las consultas en las que se consultan frecuentemente los id de los instrumentos y usuarios. Estos índices permiten una búsqueda más rápida cuando se filtra o se consulta por estos campos.
```sql
CREATE INDEX idx_instrument_id ON orders (instrumentId);
CREATE INDEX idx_user_id ON orders (userId);
```

### 2. Default en el campo datetime de la tabla orders
Se ha agregado un valor por defecto en el campo datetime de la tabla orders para que, cuando se cree una nueva orden sin especificar este valor, se utilice la fecha y hora actual.

```sql
ALTER TABLE orders
ADD COLUMN datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

Este cambio permite tener un control automático sobre la fecha de creación de cada orden, facilitando las consultas.

## Uso de Servicio + Repositorio

### ¿Por qué utilizamos el patrón Servicio + Repositorio?

El patrón Servicio + Repositorio es una combinación que ayuda a separar las responsabilidades dentro de la aplicación, proporcionando una mayor flexibilidad y modularidad. En este caso, el repositorio se encarga de interactuar directamente con la base de datos, mientras que el servicio se encarga de la lógica de negocio, como la validación y manipulación de los datos antes de que se guarden o se devuelvan al cliente.

### Cambios en la estructura de los módulos:
Se ha corregido algunas dependencias y se ha organizado el proyecto utilizando modularidad, asegurando que cada módulo tenga sus propios controladores, servicios y repositorios. Esta estructura modular ayuda a mantener el código limpio, organizado y fácil de mantener. Cada módulo tiene un conjunto definido de responsabilidades y puede ser probado de forma independiente.