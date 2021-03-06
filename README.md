_**PADC_TASK**_
`version = 0.1.0`

# FOR LOCAL

    $ INSTALL MODULES --> yarn;

    $ MIGRATE --> yarn migrate-local
                --> for creating database tables;

    $ SEED --> yarn seed-local
               \\ for adding permanent values;

    $ START --> {
        yarn server \\ with nodemon, for restarting every time
                        when updating;
    };

# FOR DEVELOPING

    $ INSTALL MODULES --> yarn;

    $ MIGRATE --> yarn migrate-dev
                  \\ for creating database tables;

    $ SEED --> yarn seed-dev
                  \\ for adding permanent values;

    $ START --> {
        yarn dev --> with .env.development;
    };

# FOR PRODUCTION

    $ INSTALL MODULES --> yarn; 

    $ MIGRATE --> yarn migrate 
                  \\ for creating database tables with .env.production;

    $ SEED --> yarn seed
               \\ for adding permanent values;

    $ START --> {
        yarn prod --> with .env.production;
        yarn start --> default start;
    };

