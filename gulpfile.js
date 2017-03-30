var gulp       = require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

	var less = require('gulp-less');
	var path = require('path');
	
	var fileinclude = require('gulp-file-include');
	
gulp.task('less', function () {
	return gulp.src('app/less/_less.less')
	.pipe(less({
		paths: [ path.join(__dirname, 'less', 'includes') ]
	}))
	.pipe(concat('styles.css'))
	.pipe(gulp.dest('dist/css/'));
});	
 
gulp.task('fileinclude', function() {
	gulp.src(['app/**.html'])
    .pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
    }))
	.pipe(gulp.dest('dist/'));
});


gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'dist' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('own-scripts', function() {
	return gulp.src('app/js/common.js') // свои скрипты
		.pipe(gulp.dest('dist/js/'));	
});

gulp.task('scripts', ['own-scripts'], function() {
		
	return gulp.src([ // Берем все необходимые библиотеки
		'app/js/libs/**/*.js', // Берем jQuery
		//'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('dist/js')); // Выгружаем в папку dist/js
});

gulp.task('css-libs', ['less'], function() {
	return gulp.src('app/css-libs/*.css') // Выбираем файл для минификации
		.pipe(concat('libs.min.css'))
		.pipe(cssnano()) // Сжимаем
		//.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('dist/css')); // Выгружаем в папку app/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'own-scripts'], function() {
	gulp.watch('app/less/**/*.less', ['less', browserSync.reload]); // Наблюдение за less файлами в папке less
	gulp.watch('app/**/*.html', ['fileinclude', browserSync.reload]); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', ['fileinclude', 'own-scripts', browserSync.reload]);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('fonts', function() { // копируем шрифты
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})

gulp.task('build', ['clean', 'fileinclude', 'img', 'less', 'scripts', 'fonts', 'css-libs'], function() {

	//var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	//.pipe(gulp.dest('dist/fonts'))

	//var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	//.pipe(gulp.dest('dist/js'));

	//var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	//.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);