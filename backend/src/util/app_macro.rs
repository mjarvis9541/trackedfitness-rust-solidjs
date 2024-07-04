#[macro_export]
macro_rules! zoom_and_enhance {
    (struct $name:ident { $($fname:ident : $ftype:ty),* }) => {
        struct $name {
            $($fname : $ftype),*
        }

        impl $name {
            fn field_names() -> &'static [&'static str] {
                static NAMES: &'static [&'static str] = &[$(stringify!($fname)),*];
                NAMES
            }
        }
    }
}

macro_rules! my_macro {
    (struct $name:ident {$($field_name:ident: $field_type:ty,)*
    }) => {
        struct $name {
            $($field_name: $field_type,)*
        }

        impl $name {
            // This is purely an example—not a good one.
            fn get_field_names() -> Vec<&'static str> {
                vec![$(stringify!($field_name)),*]
            }
        }
    }
}

// pub(crate) use zoom_and_enhance;
